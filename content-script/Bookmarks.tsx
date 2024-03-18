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
    
    return (
        <div className="flex flex-col h-full p-4">
            <div>
                {bookmarkTree.length > 0 && bookmarkTree.map(node => <BookmarkNode key={node.id} node={node} expanded={node.index === 0} />)}
            </div>
        </div>
    );
};
export default BookMarks;
