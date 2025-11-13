// Blog data will be loaded from data.js
let allPosts = [];
let currentPage = 1;
const postsPerPage = 6;
let currentCategory = 'all';
let currentSearch = '';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if not on search page (search page has its own initialization)
    if (!window.location.pathname.includes('search.html')) {
        // Check for category parameter in URL
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        if (categoryParam) {
            currentCategory = categoryParam;
        }
        
        // Check for search parameter (if coming from search page)
        const searchParam = urlParams.get('q');
        if (searchParam) {
            currentSearch = searchParam.toLowerCase();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.value = searchParam;
            }
        }
        
        loadPosts();
        setupEventListeners();
        setupMobileMenu();
        
        // Update category card visual state if category is set
        if (currentCategory !== 'all') {
            setTimeout(() => {
                const activeCard = document.querySelector(`.category-card[data-category="${currentCategory}"]`);
                if (activeCard) {
                    activeCard.style.opacity = '0.8';
                    activeCard.style.transform = 'scale(0.95)';
                }
            }, 100);
        }
    }
});

// Load posts from data.js
function loadPosts() {
    if (typeof blogPosts !== 'undefined') {
        allPosts = blogPosts;
        displayPosts();
        setupPagination();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Category filters
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const category = this.dataset.category;
            filterByCategory(category);
        });
    });

    // Footer category links
    const footerCategoryLinks = document.querySelectorAll('.footer-section a[data-category]');
    footerCategoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const category = this.dataset.category;
            // If we're on index.html, prevent default and filter
            if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
                e.preventDefault();
                filterByCategory(category);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                // If we're on another page, let the link navigate to index.html with category parameter
                this.href = `index.html?category=${category}`;
            }
        });
    });

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        // Handle Enter key to navigate to search page
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query) {
                    window.location.href = `search.html?q=${encodeURIComponent(query)}`;
                }
            }
        });
        
        // Real-time search on index page
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
            searchInput.addEventListener('input', function() {
                currentSearch = this.value.toLowerCase();
                currentPage = 1;
                displayPosts();
                setupPagination();
            });
        }
    }

    // Pagination
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('page-btn')) {
            const page = parseInt(e.target.dataset.page);
            if (page && page !== currentPage) {
                currentPage = page;
                displayPosts();
                setupPagination();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    });
}

// Filter by category
function filterByCategory(category) {
    currentCategory = category;
    currentPage = 1;
    
    // Update URL without reloading page
    const newUrl = category === 'all' 
        ? window.location.pathname 
        : `${window.location.pathname}?category=${category}`;
    window.history.pushState({ category }, '', newUrl);
    
    // Update active state
    document.querySelectorAll('.category-card').forEach(card => {
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
    });
    
    if (category !== 'all') {
        const activeCard = document.querySelector(`.category-card[data-category="${category}"]`);
        if (activeCard) {
            activeCard.style.opacity = '0.8';
            activeCard.style.transform = 'scale(0.95)';
        }
    }
    
    displayPosts();
    setupPagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Get filtered posts
function getFilteredPosts() {
    let filtered = allPosts;
    
    // Filter by category
    if (currentCategory !== 'all') {
        filtered = filtered.filter(post => post.category === currentCategory);
    }
    
    // Filter by search
    if (currentSearch) {
        const searchTerms = currentSearch.toLowerCase().trim().split(/\s+/);
        filtered = filtered.filter(post => {
            const title = post.title.toLowerCase();
            const excerpt = post.excerpt.toLowerCase();
            const content = post.content ? post.content.toLowerCase() : '';
            const category = getCategoryName(post.category).toLowerCase();
            
            // Check if all search terms match
            return searchTerms.every(term => 
                title.includes(term) ||
                excerpt.includes(term) ||
                content.includes(term) ||
                category.includes(term)
            );
        });
    }
    
    return filtered;
}

// Display posts
function displayPosts() {
    const filteredPosts = getFilteredPosts();
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const postsToShow = filteredPosts.slice(startIndex, endIndex);
    
    const blogGrid = document.getElementById('blogGrid');
    if (!blogGrid) return;
    
    if (postsToShow.length === 0) {
        blogGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                <p style="color: var(--text-secondary); font-size: 1.1rem;">No articles found. Try a different search or category.</p>
            </div>
        `;
        return;
    }
    
    blogGrid.innerHTML = postsToShow.map(post => `
        <a href="article.html?id=${post.id}" class="blog-card fade-in">
            <img src="${post.image}" alt="${post.title}" class="blog-card-image" onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'220\'%3E%3Crect fill=\'%23D4A5A5\' width=\'400\' height=\'220\'/%3E%3Ctext fill=\'%23FFFFFF\' font-family=\'Arial\' font-size=\'18\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\'%3EImage%3C/text%3E%3C/svg%3E';">
            <div class="blog-card-content">
                <span class="blog-card-category">${getCategoryName(post.category)}</span>
                <h3 class="blog-card-title">${post.title}</h3>
                <p class="blog-card-excerpt">${post.excerpt}</p>
                <div class="blog-card-meta">
                    <span><i class="far fa-calendar"></i> ${post.date}</span>
                    <span><i class="far fa-clock"></i> ${post.readTime}</span>
                </div>
            </div>
        </a>
    `).join('');
}

// Setup pagination
function setupPagination() {
    const filteredPosts = getFilteredPosts();
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    const pagination = document.getElementById('pagination');
    
    if (!pagination) return;
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button class="page-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            paginationHTML += `
                <button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += `<span style="padding: 0.5rem;">...</span>`;
        }
    }
    
    // Next button
    paginationHTML += `
        <button class="page-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    pagination.innerHTML = paginationHTML;
}

// Get category name
function getCategoryName(category) {
    const categories = {
        'fashion': 'Fashion & Accessories',
        'beauty': 'Health & Beauty',
        'home': 'Home & Garden',
        'travel': 'Travel & Accommodation',
        'finance': 'Finance & Insurance',
        'food': 'Food & Beverages'
    };
    return categories[category] || category;
}

// Mobile menu
function setupMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.nav');
    
    if (mobileMenuToggle && nav) {
        mobileMenuToggle.addEventListener('click', function() {
            const isOpen = nav.style.display === 'flex';
            if (isOpen) {
                nav.style.display = 'none';
            } else {
                nav.style.display = 'flex';
                nav.style.flexDirection = 'column';
                nav.style.position = 'absolute';
                nav.style.top = '100%';
                nav.style.left = '0';
                nav.style.right = '0';
                nav.style.background = 'var(--surface)';
                nav.style.padding = '1rem';
                nav.style.boxShadow = '0 4px 10px var(--shadow)';
                nav.style.zIndex = '1000';
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768 && nav.style.display === 'flex') {
                if (!nav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                    nav.style.display = 'none';
                }
            }
        });
    }
}

// Article page functionality
if (window.location.pathname.includes('article.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        loadArticle();
    });
}

function loadArticle() {
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');
    
    if (!articleId || typeof blogPosts === 'undefined') return;
    
    const article = blogPosts.find(post => post.id === articleId);
    if (!article) {
        document.body.innerHTML = '<div class="container" style="padding: 3rem; text-align: center;"><h1>Article not found</h1><a href="index.html">Go back home</a></div>';
        return;
    }
    
    // Set page title
    document.title = `${article.title} - OmniBazaarsite`;
    
    // Update header
    const articleHeader = document.querySelector('.article-header-content');
    if (articleHeader) {
        articleHeader.innerHTML = `
            <span class="article-category">${getCategoryName(article.category)}</span>
            <h1 class="article-title">${article.title}</h1>
            <div class="article-meta">
                <span><i class="far fa-calendar"></i> ${article.date}</span> | 
                <span><i class="far fa-clock"></i> ${article.readTime}</span>
            </div>
        `;
    }
    
    // Update content
    const articleContent = document.querySelector('.article-content');
    if (articleContent) {
        let contentHTML = '';
        
        // Add main image
        if (article.image) {
            contentHTML += `<img src="${article.image}" alt="${article.title}" class="article-image" onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'800\' height=\'400\'%3E%3Crect fill=\'%23D4A5A5\' width=\'800\' height=\'400\'/%3E%3Ctext fill=\'%23FFFFFF\' font-family=\'Arial\' font-size=\'24\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\'%3EImage%3C/text%3E%3C/svg%3E';">`;
        }
        
        // Add content paragraphs
        if (article.content) {
            contentHTML += article.content;
        }
        
        // Add products section if exists
        if (article.products && article.products.length > 0) {
            contentHTML += `
                <div class="product-section">
                    <h2>Recommended Products</h2>
                    <div class="product-grid">
                        ${article.products.map(product => `
                            <div class="product-card">
                                <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'200\'%3E%3Crect fill=\'%23D4A5A5\' width=\'300\' height=\'200\'/%3E%3Ctext fill=\'%23FFFFFF\' font-family=\'Arial\' font-size=\'16\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\'%3EProduct%3C/text%3E%3C/svg%3E';">
                                <h3 class="product-name">${product.name}</h3>
                                <p class="product-description">${product.description}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        articleContent.innerHTML = contentHTML;
    }
}

