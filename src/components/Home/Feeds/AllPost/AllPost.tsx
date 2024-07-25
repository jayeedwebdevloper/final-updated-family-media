import Link from 'next/link';
import { ParaGreaph } from './ParaGreaph';
import CommentsList from './CommentsList';

type PropsType = {
    usersData: any;
    handleComment: any;
    commentLoad: boolean;
    handleReact: any;
    isModalOpen: any;
    setIsModalOpen: any;
    modalData: any;
    setModalData: any;
    userInfo: any;
    triggerRefetch: any;
};

export default function AllPost(props: PropsType) {
    const { userInfo, usersData, handleComment, handleReact, commentLoad, isModalOpen, setIsModalOpen, modalData, setModalData, triggerRefetch } = props;

    const currentUser = usersData?.find((user: any) => user?.uid === userInfo?.user?.uid);

    const handleDelete = async (data: any) => {
        try {
            const userId = currentUser?._id;
            const postId = data._id;
            console.log("Deleting post with userId:", userId, "and postId:", postId);

            const requestBody = JSON.stringify({ userId, postId });
            const response = await fetch(`/family-api/posts`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: requestBody,
            });

            if (!response.ok) {
                const errorData = await response.text().catch(() => ({ error: 'Invalid JSON response' }));
                console.error('Response status:', response.status);
                console.error('Response text:', errorData);
                throw new Error(`Network response was not ok: ${errorData}`);
            }

            const deletedData = await response.json();
            console.log('Post deleted successfully:', deletedData);
            // Update component state or re-fetch data
        } catch (error: any) {
            console.error('Error deleting post:', error.message);
            // Handle error, e.g., show error message to user
        } finally {
        }
    };

    const allPosts = usersData
        ?.flatMap((user: any) => user.posts.map((post:any) => ({ ...post, user })))
        ?.sort((a:any, b:any) => new Date(b.postDateTime).getTime() - new Date(a.postDateTime).getTime());

    return (
        <div className='posts bg-white shadow-md rounded m-1 mt-2'>
            {allPosts?.slice().reverse().map((post: any & { user: any }, i: number) => (
                <div key={i} className='px-3 py-4'>
                    <div className="header flex justify-between">
                        <div className='w-auto flex gap-4'>
                            <img className='w-12 h-12 object-cover rounded-full border-2 border-blue-500' src={post.user?.avatar} alt="family" />
                            <div className="w-auto">
                                <Link href={`/users/${post.user?.userName}`} className='text-sky-500 font-bold capitalize text-sm'>
                                    {post.user?.displayName}
                                </Link>
                                <p className='text-xs text-stone-500'>Published:<span> {post?.postDateTime}</span></p>
                            </div>
                        </div>
                        <div className="w-12 text-end">
                            {currentUser?._id === post?.postUserId && (
                                <button
                                    onClick={() => { window.confirm("Are You Sure For Delete This Post ?") && handleDelete(post); }}
                                    className='hover:bg-slate-200 flex items-center justify-center h-10 w-10 rounded-full'
                                >
                                    <img className='w-1/2' src="/icons/delete.svg" alt="delete" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="content-post relative">
                        <div className={`absolute z-[150] w-full h-auto bg-black/70 transition-all duration-300 ${isModalOpen[i] ? "visible scale-100" : "invisible scale-0"}`}>
                            <p className='text-white text-lg font-bold py-1 px-3 text-end cursor-pointer' onClick={() => {
                                setIsModalOpen((prevOpen: any) => ({ ...prevOpen, [i]: false }));
                                setModalData({});
                            }}>⨉</p>
                            {modalData?.photo && (
                                <img className='w-3/5 h-auto mx-auto mb-4' src={modalData.photo} alt="photo" />
                            )}
                            {modalData?.video && (
                                <video controls className='w-3/5 h-auto mx-auto mb-4' src={modalData.video} />
                            )}
                        </div>
                        {post?.content && <ParaGreaph key={i} post={post?.content}></ParaGreaph>}
                        <div className={`${post?.photoUrl && post?.videoUrl ? "flex" : "w-full"} flex-wrap justify-center`}>
                            {post?.photoUrl && (
                                <div className={`w-full p-1 ${post?.photoUrl && post?.videoUrl ? "lg:w-1/2" : ""}`}>
                                    {post?.photoUrl !== "" && (
                                        <img onClick={() => {
                                            setIsModalOpen((prevOpen: any) => ({ ...prevOpen, [i]: true }));
                                            setModalData({ photo: post.photoUrl });
                                        }} key={i} className='w-full h-[250px] object-cover cursor-pointer' src={post?.photoUrl} alt="family" />
                                    )}
                                </div>
                            )}
                            {post?.videoUrl && (
                                <div className={`w-full p-1 ${post?.photoUrl && post?.videoUrl ? "lg:w-1/2" : ""}`}>
                                    {post?.videoUrl !== "" && (
                                        <video onClick={() => {
                                            setIsModalOpen((prevOpen: any) => ({ ...prevOpen, [i]: true }));
                                            setModalData({ video: post?.videoUrl });
                                        }} key={i} className='w-full h-[250px] object-cover' src={post?.videoUrl} controls />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="reacts flex gap-4 py-2">
                        <button onClick={() => handleReact(post)} className='flex gap-1 items-center'>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill={post?.reacts?.find((react: any) => react.userId === currentUser._id) ? 'rgb(0, 115, 255)' : "none"}
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className={`size-4 hover:scale-125`}
                                onClick={() => handleReact(post)}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                                />
                            </svg>
                            <span className='text-xs'>
                                {post?.reacts?.length}
                            </span>
                        </button>
                        <div className='text-xs flex gap-1 items-center'>
                            <img src="/icons/comment.svg" alt="family" className='w-4' />
                            <p>
                                {post?.comments?.length}
                            </p>
                        </div>
                    </div>

                    <div className="comments">
                        {commentLoad ? <div className='text-md text-center py-4'>Loading....</div> : <CommentsList post={post} />}
                        <div className='shadow rounded p-2 border flex flex-col sm:flex-row justify-between'>
                            <div className="2xl:w-12 xl:w-10 w-8 2xl:h-12 xl:h-10 h-8">
                                <img className='rounded-full w-full h-full object-cover' src={currentUser?.avatar} alt="" />
                            </div>
                            <form onSubmit={(e) => handleComment(e, post)} className="w-auto">
                                <label htmlFor={`comment${i}`} className='block'>Comment</label>
                                <textarea required className='2xl:w-[520px] xl:w-[500px] md:w-[320px] sm:w-[450px] w-full outline-none border focus:ring-1 focus:ring-blue-500 px-3 py-2 text-sm rounded' name="comment" id={`comment${i}`}></textarea>
                                <button className='block ms-auto px-3 py-1 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-all duration-300'>Send</button>
                            </form>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}