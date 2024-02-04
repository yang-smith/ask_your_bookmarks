// options.js
// import supabase from './supabase_client';

document.addEventListener('DOMContentLoaded', function() {
    const loadErrorsBtn = document.getElementById('loadErrors');
    const container = document.getElementById('errorUrls');

    loadErrorsBtn.addEventListener('click', function() {
        container.innerHTML = ''; // 清空当前的错误URLs
        chrome.runtime.getBackgroundPage(function(backgroundPage) {
            // 假设backgroundPage有一个方法来获取错误的URLs
            const errors = backgroundPage.getErrors(); 
            console.log(errors);
            errors.forEach(error => {
                const div = document.createElement('div');
                div.innerHTML = `
                    <p>${error.url}</p>
                    <button class="deleteBtn" data-url="${error.url}">删除</button>
                `;
                container.appendChild(div);
            });

            document.querySelectorAll('.deleteBtn').forEach(button => {
                button.addEventListener('click', function() {
                    const url = this.getAttribute('data-url');
                    backgroundPage.deleteBookmark(url); // 删除书签的函数
                    this.parentElement.remove(); // 移除这个元素
                });
            });
        });
    });

    const signUpBtn = document.getElementById('signUp');
    signUpBtn.addEventListener('click', async function() {
        console.log("sign upping ")
        chrome.runtime.sendMessage({command: "signupUser", data:{e: "test@email.com", p: "test123"}}, (response) => {
            console.log(response);
          });
        // 执行签出成功后的操作
        console.log('Signed out successfully');
    });

});
