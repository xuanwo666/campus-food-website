// API配置
// 将第2行的API_BASE_URL修改为：
const API_BASE_URL = 'https://www-school-api.r68031028.nyat.app:36140/api';

// 导航栏滚动效果
const navbar = document.getElementById('navbar');
const backToTopBtn = document.getElementById('back-to-top');

if (navbar && backToTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('py-2', 'shadow-md');
            navbar.classList.remove('py-3', 'shadow-sm');
            backToTopBtn.classList.remove('translate-y-20', 'opacity-0');
            backToTopBtn.classList.add('translate-y-0', 'opacity-100');
        } else {
            navbar.classList.add('py-3', 'shadow-sm');
            navbar.classList.remove('py-2', 'shadow-md');
            backToTopBtn.classList.add('translate-y-20', 'opacity-0');
            backToTopBtn.classList.remove('translate-y-0', 'opacity-100');
        }
    });
}

// 移动端菜单切换
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        if (mobileMenu.classList.contains('hidden')) {
            menuToggle.innerHTML = '<i class="fa fa-bars text-xl"></i>';
        } else {
            menuToggle.innerHTML = '<i class="fa fa-times text-xl"></i>';
        }
    });
}

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            // 关闭移动菜单（如果打开）
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                if (menuToggle) {
                    menuToggle.innerHTML = '<i class="fa fa-bars text-xl"></i>';
                }
            }
            
            // 平滑滚动到目标位置
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// 回到顶部
if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// 分类标签切换
const categoryBtns = document.querySelectorAll('.category-btn');
categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        categoryBtns.forEach(b => b.classList.remove('active', 'bg-primary', 'text-white'));
        categoryBtns.forEach(b => b.classList.add('bg-white', 'text-neutral', 'hover:bg-primary/10'));
        btn.classList.add('active', 'bg-primary', 'text-white');
        btn.classList.remove('bg-white', 'text-neutral', 'hover:bg-primary/10');
    });
});

// 用户认证相关函数
class AuthManager {
    static async checkLoginStatus() {
        try {
            const response = await fetch(`${API_BASE_URL}/user`, {
                method: 'GET',
                credentials: 'include'
            });
            const data = await response.json();
            return data.success ? data.user : null;
        } catch (error) {
            console.error('检查登录状态失败:', error);
            return null;
        }
    }

    static async login(studentId, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    student_id: studentId,
                    password: password
                })
            });
            return await response.json();
        } catch (error) {
            console.error('登录失败:', error);
            return { success: false, message: '网络错误，请稍后重试' };
        }
    }

    static async register(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(userData)
            });
            return await response.json();
        } catch (error) {
            console.error('注册失败:', error);
            return { success: false, message: '网络错误，请稍后重试' };
        }
    }

    static async logout() {
        try {
            const response = await fetch(`${API_BASE_URL}/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            return await response.json();
        } catch (error) {
            console.error('退出登录失败:', error);
            return { success: false, message: '网络错误，请稍后重试' };
        }
    }
}

// 菜品数据管理
class DishManager {
    static async loadDishes() {
        try {
            const response = await fetch(`${API_BASE_URL}/dishes`, {
                method: 'GET',
                credentials: 'include'
            });
            const data = await response.json();
            return data.success ? data.dishes : [];
        } catch (error) {
            console.error('加载菜品失败:', error);
            return [];
        }
    }

    static async submitReview(dishName, canteenName, rating, evaluation) {
        try {
            const response = await fetch(`${API_BASE_URL}/review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    dish_name: dishName,
                    canteen_name: canteenName,
                    rating: rating,
                    evaluation: evaluation
                })
            });
            return await response.json();
        } catch (error) {
            console.error('提交评价失败:', error);
            return { success: false, message: '网络错误，请稍后重试' };
        }
    }

    static renderDishes(dishes) {
        const dishesContainer = document.querySelector('#dishes .grid');
        if (!dishesContainer) return;

        dishesContainer.innerHTML = '';

        dishes.forEach(dish => {
            const dishCard = this.createDishCard(dish);
            dishesContainer.appendChild(dishCard);
        });
    }

    static createDishCard(dish) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-custom scale-hover cursor-pointer';
        
        // 使用数据库中的真实图片路径，如果没有则使用随机图片
        const imageUrl = dish.image_path || this.getRandomImage();
        const rating = dish.avg_rating || 0;
        const reviewCount = dish.rating_count || 0;
        
        card.innerHTML = `
            <img src="${imageUrl}" alt="${dish.dish_name}" class="w-full h-56 object-cover">
            <div class="p-6">
                <div class="flex justify-between items-start mb-3">
                    <h3 class="text-xl font-bold">${dish.dish_name}</h3>
                    <div class="flex items-center">
                        <i class="fa fa-star text-yellow-400"></i>
                        <span class="ml-1 font-medium">${rating.toFixed(1)}</span>
                    </div>
                </div>
                <p class="text-neutral/70 mb-4 line-clamp-2">来自${dish.canteen_name}的美味佳肴，已有${reviewCount}位同学评价</p>
                <div class="flex justify-between items-center">
                    <span class="text-sm text-neutral/70">${dish.canteen_name}</span>
                    <button class="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium transition-all" onclick="viewDishDetail('${dish.dish_name}', '${dish.canteen_name}', ${rating}, '${imageUrl}')">
                        查看详情
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }

    static getRandomImage() {
        const imageIds = [431, 292, 488, 96, 312, 225, 367, 102, 169, 184];
        const randomId = imageIds[Math.floor(Math.random() * imageIds.length)];
        return `https://picsum.photos/id/${randomId}/800/600`;
    }
}

// 页面初始化
document.addEventListener('DOMContentLoaded', async () => {
    // 检查登录状态
    const user = await AuthManager.checkLoginStatus();
    updateUIForUser(user);
    
    // 加载菜品数据
    const dishes = await DishManager.loadDishes();
    DishManager.renderDishes(dishes);
});

// 更新UI显示用户状态
function updateUIForUser(user) {
    const loginLinks = document.querySelectorAll('a[href="login.html"]');
    const registerLinks = document.querySelectorAll('a[href="register.html"]');
    
    if (user) {
        // 用户已登录，显示用户名和退出按钮
        loginLinks.forEach(link => {
            link.textContent = user.username;
            link.href = '#';
            link.onclick = (e) => {
                e.preventDefault();
                showUserMenu();
            };
        });
        
        registerLinks.forEach(link => {
            link.textContent = '退出';
            link.href = '#';
            link.onclick = async (e) => {
                e.preventDefault();
                const result = await AuthManager.logout();
                if (result.success) {
                    location.reload();
                }
            };
        });
    }
}

// 显示用户菜单
function showUserMenu() {
    // 这里可以添加用户菜单的显示逻辑
    alert('用户菜单功能待开发');
}

// 查看菜品详情
function viewDishDetail(dishName, canteenName, rating, imageUrl) {
    const params = new URLSearchParams({
        name: dishName,
        canteen: canteenName,
        rating: rating,
        image: imageUrl
    });
    window.location.href = `dish-detail.html?${params.toString()}`;
}

// 导出全局函数
window.AuthManager = AuthManager;
window.DishManager = DishManager;
window.viewDishDetail = viewDishDetail;
