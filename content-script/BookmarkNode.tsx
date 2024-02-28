import React, { useState } from 'react';

const BookmarkNode = ({ node }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => setIsExpanded(!isExpanded);
    const nodeTitle = node.title || "无标题";

    return (
        <div key={node.id} className="ml-2">
            {node.url ? (
                // 如果节点是一个书签，渲染一个链接
                <div className="pl-1">
                    <a href={node.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">
                        <strong>{node.title}</strong>
                    </a>
                </div>
            ) : (
                // 如果节点有子节点，渲染一个可展开/折叠的标题和子节点列表
                <>
                    <div className="flex items-center">
                        <button
                            onClick={toggleExpand}
                            className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''} mr-2`}
                        >
                            <svg className="w-4 h-4 text-gray-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M9 5l7 7-7 7"></path>
                            </svg>
                        </button>
                        <strong className="cursor-pointer">{nodeTitle}</strong>
                    </div>
                    {isExpanded && (
                        <div className="ml-4">
                            {node.children.map(child => (
                                <BookmarkNode key={child.id} node={child} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default BookmarkNode;
