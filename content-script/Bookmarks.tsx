import { useEffect, useState } from "react";
import browser from "webextension-polyfill";
import BookmarkNode from "./BookmarkNode";
import React from "react";

const BookMarks = ({ ChangeToSearch }) => {
    const [bookmarkTree, setBookmarkTree] = useState([]);

    useEffect(() => {
        const fetchBookmarks = async () => {
            const tree = await browser.bookmarks.getTree();
            setBookmarkTree(tree[0].children);
        };
        fetchBookmarks();
    }, []);

    useEffect(() => {
        console.log("show bookmarktree: ",bookmarkTree);
    }, [bookmarkTree]); 
    
    return (
        <div className="flex flex-col h-full p-4">
            <div>
                <p className='font-bold text-slate-700 text-slate-800'>
                    <a onClick={ChangeToSearch}>Back</a>
                </p>
            </div>
            <div>
                {bookmarkTree.length > 0 && bookmarkTree.map(node => <BookmarkNode key={node.id} node={node} />)}
            </div>
        </div>
    );
};
export default BookMarks;
