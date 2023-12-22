import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import {
    getIndiPost,
    onUnlike,
    onLike,
    resetCurrPost,
    getUserNameFromUserId,
    deletePost,
} from '../features/pixify/pixifySlice'
import ClipLoader from 'react-spinners/ClipLoader'
import { FaHeart, FaTrash } from 'react-icons/fa'

const IndiPost = () => {
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { currentPost, userId } = useSelector((store) => store.pixify)
    const { postUserName } = currentPost
    const { id } = useParams()
    const fetchIndiPost = async () => {
        setLoading(true)
        let response = await dispatch(getIndiPost(id))
        if (response.error) {
            navigate('/')
        }
        response = await dispatch(
            getUserNameFromUserId({ userId: response.payload.postUserId })
        )
        if (response.error) {
            navigate('/')
        }
        setLoading(false)
    }

    const handleOnClickLike = async () => {
        await dispatch(onLike({ id, userId }))
        fetchIndiPost({ userId })
    }

    const handleOnClickUnlike = async () => {
        await dispatch(onUnlike({ id, userId }))
        fetchIndiPost({ userId })
    }

    const handleOnClickDelete = async () => {
        const response = await dispatch(deletePost({ id }))
        setLoading(false)
        navigate('/myposts')
    }

    useEffect(() => {
        setLoading(true)
        fetchIndiPost()
        return () => {
            dispatch(resetCurrPost())
        }
    }, [dispatch, id])

    if (loading) {
        return (
            <section className="w-full">
                <div className="p-8">
                    <div className="max-w-[400px] m-auto">
                        <div className="w-full flex items-center justify-center">
                            <ClipLoader
                                loading={loading}
                                size={50}
                                color="white"
                            />
                        </div>
                    </div>
                </div>
            </section>
        )
    } else {
        return (
            <section className="w-full">
                <div className="p-8">
                    <div className="max-w-[400px] m-auto">
                        <div className="flex flex-col w-full">
                            <div className="m-auto w-full">
                                <img
                                    src={currentPost.imageUrl}
                                    alt={currentPost.title}
                                    className="w-full rounded-2xl shadow-2xl"
                                />
                            </div>
                            <div className="m-auto w-full mt-8 flex flex-col justify-between">
                                <div className="flex items-center justify-between w-full">
                                    <div className="font-bold text-2xl">
                                        {currentPost.title}
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <div className="hover:scale-105 duration-300 cursor-pointer">
                                            {currentPost.likedByLoggedInUser ? (
                                                <FaHeart
                                                    color="red"
                                                    onClick={(id) =>
                                                        handleOnClickUnlike(id)
                                                    }
                                                />
                                            ) : (
                                                <FaHeart
                                                    onClick={(id) =>
                                                        handleOnClickLike(id)
                                                    }
                                                />
                                            )}
                                        </div>
                                        <div className="ml-2 w-2">
                                            {currentPost.likedBy.length}
                                        </div>
                                        {currentPost.postUserId == userId ? (
                                            <div className="ml-4 hover:scale-105 duration-300 cursor-pointer">
                                                <FaTrash
                                                    onClick={
                                                        handleOnClickDelete
                                                    }
                                                />
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                                {postUserName}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        )
    }
}

export default IndiPost
