import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { onPost } from '../features/pixify/pixifySlice'
import ClipLoader from 'react-spinners/ClipLoader'

const CreatePost = () => {
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    const [title, setTitle] = useState('')
    const [file, setFile] = useState(null)
    const navigate = useNavigate()
    const { userName, userId } = useSelector((store) => store.pixify)
    const onClickPost = async () => {
        try {
            setLoading(true)
            const res = await dispatch(
                onPost({ file, title, userName, userId })
            )
            if (!res.error) {
                setLoading(false)
                navigate('/')
            } else {
                setLoading(false)
            }
        } catch (error) {
            setLoading(false)
        }
        setTitle('')
        setFile(null)
    }

    if (loading) {
        return (
            <section className="w-full">
                <div className="p-8">
                    <div className="max-w-[500px] m-auto">
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
            <>
                <section className="w-full">
                    <div className="p-8">
                        <div className="m-auto max-w-[1000px] bg-gradient-to-br from-green-900 via-gray-800 to-green-900 rounded-2xl p-7 grid grid-cols-2 gap-8 ">
                            <div className="col-span-2">
                                <div className="text-md font-extrabold">
                                    Add Title and Picture
                                </div>
                                <div className="text-md font-extrabold">
                                    and your Post is{' '}
                                    <span className="text-lime-500">
                                        READY!
                                    </span>
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-bold">30 secs</div>
                            </div>
                            <div className="text-sm flex items-end justify-end font-bold text-green-200 cursor-pointer">
                                Upload right now
                            </div>
                        </div>
                    </div>
                </section>
                <section className="w-full">
                    <div className="p-8">
                        <div className="w-full m-auto max-w-[1000px]">
                            <div className="max-w-[700px]">
                                <input
                                    type="text"
                                    placeholder="Enter title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full text-sm p-4 rounded-full bg-gradient-to-r from-gray-800 to-slate-900"
                                />
                            </div>
                            <div className="max-w-[700px] mt-8">
                                <label>
                                    <input
                                        type="file"
                                        className="text-sm text-grey-500 file:mr-5 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-900 hover:file:cursor-pointer hover:file:bg-amber-50 hover:file:text-amber-700"
                                        onChange={(e) =>
                                            setFile(e.target.files[0])
                                        }
                                    />
                                </label>
                            </div>
                            <button
                                className="text-grey-500 mr-5 py-2 px-6 rounded-full border-0 text-md font-medium bg-blue-50 text-blue-900 hover:cursor-pointer hover:bg-amber-50  hover:text-amber-700 mt-8 hover:scale-105 duration-300"
                                onClick={onClickPost}
                            >
                                POST
                            </button>
                        </div>
                    </div>
                </section>
            </>
        )
    }
}

export default CreatePost
