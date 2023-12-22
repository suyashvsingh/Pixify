import { Link } from 'react-router-dom'

const Account = () => {
    return (
        <section className="w-full">
            <div className="p-8 pt-2">
                <div className="m-auto max-w-[1000px]">
                    <div className="mb-8">
                        <p className="font-bold text-xl">Account</p>
                    </div>
                    <ul>
                        <li>
                            <Link to="/myposts">
                                <div>My posts</div>
                            </Link>
                        </li>
                        <li>
                            <Link to="/likedposts">
                                <div>My likes</div>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    )
}

export default Account
