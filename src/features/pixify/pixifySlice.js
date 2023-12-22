import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { signInWithPopup, signOut, getAdditionalUserInfo } from 'firebase/auth'
import { auth, provider, db, storage } from '../../firebase'
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
} from 'firebase/storage'
import {
    collection,
    addDoc,
    getDocs,
    setDoc,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    startAfter,
    limit,
    where,
} from 'firebase/firestore'
import { v4 } from 'uuid'

const userName = localStorage.getItem('userName')
const userId = localStorage.getItem('userId')

const initialState = {
    isLoggedIn: userId ? true : false,
    userName: userName ? userName : null,
    userId: userId ? userId : null,
    displayData: [],
    currentPost: {
        imageUrl: null,
        title: null,
        postUserId: null,
        postUserName: null,
        likedBy: null,
        likedByLoggedInUser: false,
    },
    likedPosts: [],
    postedPosts: [],
    lastDoc: null,
    startIdxPostedPosts: 0,
    startIdxLikedPosts: 0,
    isError: false,
    message: '',
}

export const onLogin = createAsyncThunk('pixify/onLogin', async (thunkAPI) => {
    try {
        const response = await signInWithPopup(auth, provider)
        if (getAdditionalUserInfo(response).isNewUser) {
            const docRef = doc(db, 'users', auth.currentUser.uid)
            await setDoc(docRef, {
                userName: auth.currentUser.displayName,
                likedPosts: [],
                postedPosts: [],
            })
        }
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message)
    }
})

export const onLogout = createAsyncThunk(
    'pixify/onLogout',
    async (thunkAPI) => {
        try {
            await signOut(auth, provider)
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message)
        }
    }
)

export const fetchData = createAsyncThunk(
    'pixify/fetchData',
    async (search, thunkAPI) => {
        try {
            console.log(search)
            const postsRef = collection(db, 'posts')
            let q
            if (search) {
                q = query(postsRef, limit(4), where('title', '==', search))
            } else {
                q = query(postsRef, orderBy('title'), limit(4))
            }
            let data = []
            let lastDoc
            const postsSnap = await getDocs(q)
            postsSnap.docs.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() })
                lastDoc = doc
            })
            return { data, lastDoc }
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message)
        }
    }
)

export const onPost = createAsyncThunk(
    'pixify/onPost',
    async ({ file, title, userId }, thunkAPI) => {
        if (file === null) {
            return thunkAPI.rejectWithValue('Select an image')
        }

        if (file['type'].split('/')[0] !== 'image') {
            return thunkAPI.rejectWithValue('Selected file is not an image')
        }

        if (!title) {
            return thunkAPI.rejectWithValue('Add a title')
        }

        try {
            const storageRef = ref(storage, `images/${file.name + v4()}`)

            const snapshot = await uploadBytes(storageRef, file)
            const url = await getDownloadURL(snapshot.ref)

            const docRefPosts = await addDoc(collection(db, 'posts'), {
                postUserId: userId,
                imageUrl: url,
                title: title,
                likedBy: [],
            })

            const docRefUsers = doc(db, 'users', userId)
            const docSnapUsers = await getDoc(docRefUsers)
            await updateDoc(docRefUsers, {
                postedPosts: [
                    ...docSnapUsers.data().postedPosts,
                    docRefPosts.id,
                ],
            })
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message)
        }
    }
)

export const getIndiPost = createAsyncThunk(
    'pixify/getIndiPost',
    async (id, thunkAPI) => {
        const docRef = doc(db, 'posts', id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
            return docSnap.data()
        } else {
            return thunkAPI.rejectWithValue('No post with this id')
        }
    }
)

export const onLike = createAsyncThunk(
    'pixify/onLike',
    async ({ id, userId }, thunkAPI) => {
        try {
            let docRef = doc(db, 'posts', id)
            let docSnap = await getDoc(docRef)
            if (!(await docSnap.data().likedBy.includes(userId))) {
                await updateDoc(docRef, {
                    likedBy: [...docSnap.data().likedBy, userId],
                })
                docRef = doc(db, 'users', userId)
                docSnap = await getDoc(docRef)
                await updateDoc(docRef, {
                    likedPosts: [...docSnap.data().likedPosts, id],
                })
            }
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message)
        }
    }
)

export const onUnlike = createAsyncThunk(
    'pixify/onUnlike',
    async ({ id, userId }, thunkAPI) => {
        try {
            let docRef = doc(db, 'posts', id)
            let docSnap = await getDoc(docRef)
            const updatedLikedBy = await docSnap
                .data()
                .likedBy.filter((indiUserId) => indiUserId !== userId)
            await updateDoc(docRef, {
                likedBy: updatedLikedBy,
            })
            docRef = doc(db, 'users', userId)
            docSnap = await getDoc(docRef)
            const updatedLikedPosts = await docSnap
                .data()
                .likedPosts.filter((indiLikedPosts) => indiLikedPosts !== id)
            await updateDoc(docRef, {
                likedPosts: updatedLikedPosts,
            })
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message)
        }
    }
)

export const getLikedPosts = createAsyncThunk(
    'pixify/getLikedPosts',
    async ({ userId }, thunkAPI) => {
        try {
            let docRef = doc(db, 'users', userId)
            let docSnap = await getDoc(docRef)
            const likedPostsIds = docSnap.data().likedPosts
            let data = []
            let count = 0
            let i
            for (i = 0; i < likedPostsIds.length; i++) {
                if (count >= 4) {
                    break
                }
                let id = likedPostsIds[i]
                docRef = doc(db, 'posts', id)
                docSnap = await getDoc(docRef)
                if (docSnap.data() !== undefined) {
                    count++
                    data.push({ id: docSnap.id, ...docSnap.data() })
                }
            }
            return { data, i }
        } catch (error) {
            thunkAPI.rejectWithValue(error.message)
        }
    }
)

export const getPostedPosts = createAsyncThunk(
    'pixify/getPostedPosts',
    async ({ userId }, thunkAPI) => {
        try {
            let docRef = doc(db, 'users', userId)
            let docSnap = await getDoc(docRef)
            const myPostsIds = docSnap.data().postedPosts
            let data = []
            let count = 0
            let i
            for (i = 0; i < myPostsIds.length; i++) {
                if (count >= 4) {
                    break
                }
                let id = myPostsIds[i]
                docRef = doc(db, 'posts', id)
                docSnap = await getDoc(docRef)
                if (docSnap.data() !== undefined) {
                    count++
                    data.push({ id: docSnap.id, ...docSnap.data() })
                }
            }
            return { data, i }
        } catch (error) {
            thunkAPI.rejectWithValue(error.message)
        }
    }
)

export const getUserNameFromUserId = createAsyncThunk(
    'pixify/getUserNameFromUserId',
    async ({ userId }, thunkAPI) => {
        try {
            const docRef = doc(db, 'users', userId)
            const docSnap = await getDoc(docRef)
            return await docSnap.data().userName.split(' ')[0]
        } catch (error) {
            thunkAPI.rejectWithValue(error.message)
        }
    }
)

export const deletePost = createAsyncThunk(
    'pixify/deletePost',
    async ({ id }, thunkAPI) => {
        try {
            const docRef = doc(db, 'posts', id)
            const data = (await getDoc(docRef)).data()
            const { imageUrl } = data
            const httpsReference = ref(storage, imageUrl)
            deleteDoc(docRef)
            deleteObject(httpsReference)
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message)
        }
    }
)

export const loadMoreHome = createAsyncThunk(
    'pixify/loadMoreHome',
    async ({ lastDoc, search }) => {
        try {
            const postsRef = collection(db, 'posts')
            let q
            if (search) {
                q = query(
                    postsRef,
                    limit(4),
                    startAfter(lastDoc),
                    where('title', '==', search)
                )
            } else {
                q = query(
                    postsRef,
                    orderBy('title'),
                    limit(4),
                    startAfter(lastDoc)
                )
            }
            let data = []
            let lastDocCurrent
            const postsSnap = await getDocs(q)
            postsSnap.docs.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() })
                lastDocCurrent = doc
            })
            return { data, lastDocCurrent }
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message)
        }
    }
)

export const loadMorePostedPosts = createAsyncThunk(
    'pixify/loadMorePostedPosts',
    async ({ userId, startIdxPostedPosts }) => {
        try {
            let docRef = doc(db, 'users', userId)
            let docSnap = await getDoc(docRef)
            const myPostsIds = docSnap.data().postedPosts
            let data = []
            let count = 0
            let i
            for (i = startIdxPostedPosts; i < myPostsIds.length; i++) {
                if (count >= 4) {
                    break
                }
                let id = myPostsIds[i]
                docRef = doc(db, 'posts', id)
                docSnap = await getDoc(docRef)
                if (docSnap.data() !== undefined) {
                    count++
                    data.push({ id: docSnap.id, ...docSnap.data() })
                }
            }
            if (count === 0) {
                throw new Error('Nothing more to display')
            }
            return { data, i }
        } catch (error) {
            thunkAPI.rejectWithValue(error.message)
        }
    }
)

export const loadMoreLikedPosts = createAsyncThunk(
    'pixify/loadMoreLikedPosts',
    async ({ userId, startIdxLikedPosts }) => {
        try {
            let docRef = doc(db, 'users', userId)
            let docSnap = await getDoc(docRef)
            const likedPostsIds = docSnap.data().likedPosts
            let data = []
            let count = 0
            let i
            for (i = startIdxLikedPosts; i < likedPostsIds.length; i++) {
                if (count >= 4) {
                    break
                }
                let id = likedPostsIds[i]
                docRef = doc(db, 'posts', id)
                docSnap = await getDoc(docRef)
                if (docSnap.data() !== undefined) {
                    count++
                    data.push({ id: docSnap.id, ...docSnap.data() })
                }
            }
            if (count === 0) {
                throw new Error('Nothing more to display')
            }
            return { data, i }
        } catch (error) {
            thunkAPI.rejectWithValue(error.message)
        }
    }
)

const pixifySlice = createSlice({
    name: 'pixifySlice',
    initialState,
    reducers: {
        resetCurrPost: (state) => {
            state.currentPost.imageUrl = null
            state.currentPost.title = null
            state.currentPost.postUserId = null
            state.currentPost.likedBy = null
            state.currentPost.likedByLoggedInUser = false
        },
        resetHome: (state) => {
            state.displayData = []
            state.lastDoc = null
        },
    },
    extraReducers: {
        [onLogin.fulfilled]: (state) => {
            state.isLoggedIn = true
            localStorage.setItem('userId', auth.currentUser.uid)
            localStorage.setItem(
                'userName',
                auth.currentUser.displayName.split(' ')[0]
            )
            state.userId = auth.currentUser.uid
            state.userName = auth.currentUser.displayName.split(' ')[0]
            state.isError = false
            state.message = `Welcome ${state.userName}`
        },
        [onLogin.pending]: (state) => {
            state.isError = false
            state.message = ''
        },
        [onLogin.rejected]: (state, { payload }) => {
            state.isError = true
            state.message = payload
        },

        [onLogout.fulfilled]: (state) => {
            state.isLoggedIn = false
            state.userName = null
            state.userId = null
            state.displayData = []
            state.likedPosts = []
            state.postedPosts = []
            state.message = 'Logged out'
            localStorage.removeItem('userName')
            localStorage.removeItem('userId')
            state.isError = false
        },
        [onLogout.pending]: (state) => {
            state.isError = false
            state.message = ''
        },
        [onLogout.rejected]: (state, { payload }) => {
            state.isError = true
            state.message = payload
        },

        [fetchData.fulfilled]: (state, { payload }) => {
            if (payload) {
                state.displayData = payload.data
                state.lastDoc = payload.lastDoc
            }
            state.message = ''
            state.isError = false
        },
        [fetchData.pending]: (state) => {
            state.isError = false
            state.message = ''
        },
        [fetchData.rejected]: (state, { payload }) => {
            state.isError = true
            state.message = payload
        },

        [loadMoreHome.fulfilled]: (state, { payload }) => {
            state.displayData = [...state.displayData, ...payload.data]
            state.lastDoc = payload.lastDocCurrent
        },
        [loadMoreHome.pending]: (state) => {
            state.isError = false
            state.message = ''
        },
        [loadMoreHome.rejected]: (state) => {
            state.isError = true
            state.message = 'Nothing more to display'
        },

        [loadMorePostedPosts.fulfilled]: (state, { payload }) => {
            state.postedPosts = [...state.postedPosts, ...payload.data]
            state.startIdxPostedPosts = payload.i
            state.message = ''
            state.isError = false
        },
        [loadMorePostedPosts.pending]: (state) => {
            state.isError = false
            state.message = ''
        },
        [loadMorePostedPosts.rejected]: (state) => {
            state.isError = true
            state.message = 'Nothing more to display'
        },

        [loadMoreLikedPosts.fulfilled]: (state, { payload }) => {
            state.likedPosts = [...state.likedPosts, ...payload.data]
            state.startIdxLikedPosts = payload.i
            state.message = ''
            state.isError = false
        },
        [loadMoreLikedPosts.pending]: (state) => {
            state.isError = false
            state.message = ''
        },
        [loadMoreLikedPosts.rejected]: (state) => {
            state.isError = true
            state.message = 'Nothing more to display'
        },

        [onPost.fulfilled]: (state) => {
            state.isError = false
            state.message = 'Post successfull'
            state.displayData = []
        },
        [onPost.pending]: (state) => {
            state.isError = false
            state.message = ''
        },
        [onPost.rejected]: (state, { payload }) => {
            state.isError = true
            state.message = payload
        },

        [getIndiPost.fulfilled]: (state, { payload }) => {
            payload.likedBy.includes(state.userId)
                ? (state.currentPost.likedByLoggedInUser = true)
                : (state.currentPost.likedByLoggedInUser = false)

            state.isError = false
            state.currentPost.imageUrl = payload.imageUrl
            state.currentPost.title = payload.title
            state.currentPost.postUserId = payload.postUserId
            state.currentPost.likedBy = payload.likedBy
        },
        [getIndiPost.pending]: (state) => {
            state.isError = false
            state.message = ''
        },
        [getIndiPost.rejected]: (state, { payload }) => {
            state.message = payload
            state.isError = true
        },

        [onLike.fulfilled]: (state) => {
            state.isError = false
        },

        [onUnlike.fulfilled]: (state) => {
            state.isError = false
        },

        [getLikedPosts.fulfilled]: (state, { payload }) => {
            state.likedPosts = payload.data
            state.startIdxLikedPosts = payload.i
            state.message = ''
            state.isError = false
        },
        [getLikedPosts.pending]: (state) => {
            state.isError = false
            state.message = ''
        },
        [getLikedPosts.rejected]: (state, { payload }) => {
            state.message = payload
            state.isError = true
        },

        [getPostedPosts.fulfilled]: (state, { payload }) => {
            state.postedPosts = payload.data
            state.startIdxPostedPosts = payload.i
            state.message = ''
            state.isError = false
        },
        [getPostedPosts.pending]: (state) => {
            state.isError = false
            state.message = ''
        },
        [getPostedPosts.rejected]: (state, { payload }) => {
            state.message = payload
            state.isError = true
        },

        [getUserNameFromUserId.fulfilled]: (state, { payload }) => {
            state.currentPost.postUserName = payload
        },
        [getUserNameFromUserId.pending]: (state) => {
            state.isError = false
            state.message = ''
        },
        [getUserNameFromUserId.rejected]: (state, { payload }) => {
            state.message = payload
            state.isError = true
        },

        [deletePost.fulfilled]: (state) => {
            state.isError = false
            state.message = 'Post deleted'
        },
        [deletePost.pending]: (state) => {
            state.isError = false
            state.message = ''
        },
        [deletePost.rejected]: (state, { payload }) => {
            state.message = payload
            state.isError = true
        },
    },
})

export const { resetCurrPost, resetHome } = pixifySlice.actions

export default pixifySlice.reducer
