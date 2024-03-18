export function Prompt_zn(question: string, contents: string): string {
    const prompt = `
        您的任务是从我提供的多个URL及其对应的内容描述中筛选出我可能感兴趣的URL。您需要基于我在对话中提到的兴趣点和偏好来进行选择。
        我提供的数据使用这样的结构[website name](url) - description。
        
        user quesion：
        ${question}

        URL and it's content summary：
        ${contents}

                
        输出示例
        - [website name](url) - 此链接的内容与您之前提到的A主题高度相关，且包含最新的研究成果。
        - [website name](url) - 考虑到您对B领域的兴趣，这个资源提供了深入的分析和独特的视角。
        
        `
    return prompt
}

export function Prompt(question: string, contents: string): string {
    const prompt = `
        Your task is to filter through multiple URLs and their corresponding content descriptions that I provide, to identify URLs that may interest me. You need to make selections based on interests and preferences I've mentioned in our conversation.
        The data is structured like this: [website name](url) - description.
        
        User question:
        ${question}

        URL and its content summary:
        ${contents}

                
        Output examples:
        - [website name](url) - This link is highly relevant to the A topic you mentioned earlier, and contains the latest research findings.
        - [website name](url) - Given your interest in the B field, this resource offers in-depth analysis and unique perspectives.
        
        `
    return prompt
}
