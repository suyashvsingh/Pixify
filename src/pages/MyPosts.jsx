import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getPostedPosts } from '../features/pixify/pixifySlice'
import ClipLoader from 'react-spinners/ClipLoader'
import Card from '../components/Card'
import LoadMore from '../components/LoadMore'

const MyPosts = () => {
    const [loading, setLoading] = useState(true)
    const dispatch = useDispatch()
    const { userId, postedPosts } = useSelector((store) => store.pixify)

    const fetchPostedPosts = async () => {
        setLoading(true)
        await dispatch(getPostedPosts({ userId }))
        setLoading(false)
    }

    useEffect(() => {
        const fetch = async () => {
            await fetchPostedPosts()
        }
        fetch()
    }, [])

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
    }

    if (postedPosts.length === 0) {
        return (
            <section className="w-full">
                <div className="p-8">
                    <div className="m-auto max-w-[1000px]">
                        <div className="flex items-center justify-center">
                            <div className="text-xl font-bold">
                                You haven't posted Yet
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <>
            <section className="w-full">
                <div className="p-8 pt-2">
                    <div className="m-auto max-w-[1000px] ">
                        <div className="mb-8">
                            <p className="font-bold text-xl">My posts</p>
                        </div>
                        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
                            {postedPosts.map((post) => {
                                return <Card {...post} key={post.id} />
                            })}
                        </div>
                    </div>
                </div>
            </section>
            <LoadMore issuer="MyPosts" />
        </>
    )
}

export default MyPosts
