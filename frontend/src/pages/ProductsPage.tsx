import React, { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const skinTypeOptions = ['normal', 'dry', 'oily', 'combination', 'sensitive'];
const categoryOptions = ['cleanser', 'toner', 'serum', 'moisturizer', 'sunscreen', 'exfoliant', 'mask', 'eye cream', 'oil'];
const priceRangeOptions = ['budget', 'mid', 'premium', 'luxury'];
const concernOptions = ['acne', 'aging', 'dryness', 'oiliness', 'sensitivity', 'hyperpigmentation', 'redness', 'dark spots', 'fine lines', 'texture'];
const sortOptions = [
  { value: 'rating', label: 'Top Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
];

const ProductCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse">
    <div className="h-40 bg-gray-200 dark:bg-gray-700" />
    <div className="p-4 space-y-3">
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mt-4" />
    </div>
  </div>
);

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSkinTypes, setSelectedSkinTypes] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('rating');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const ITEMS_PER_PAGE = 12;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string | number> = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        sort: sortBy,
      };
      if (selectedSkinTypes.length > 0) params.skinType = selectedSkinTypes.join(',');
      if (selectedCategory) params.category = selectedCategory;
      if (selectedPriceRange) params.priceRange = selectedPriceRange;
      if (selectedConcerns.length > 0) params.concerns = selectedConcerns.join(',');

      let response;
      if (debouncedSearch.trim()) {
        response = await productsAPI.searchProducts(debouncedSearch, params);
      } else {
        response = await productsAPI.getProducts(params);
      }

      const data = response.data;
      setProducts(data?.data || data?.products || []);
      setTotalPages(data?.pagination?.pages || data?.totalPages || 1);
      setTotalCount(data?.pagination?.total || data?.total || 0);
    } catch {
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortBy, selectedSkinTypes, selectedCategory, selectedPriceRange, selectedConcerns, debouncedSearch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const toggleSkinType = (type: string) => {
    setSelectedSkinTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    setCurrentPage(1);
  };

  const toggleConcern = (concern: string) => {
    setSelectedConcerns((prev) =>
      prev.includes(concern) ? prev.filter((c) => c !== concern) : [...prev, concern]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedSkinTypes([]);
    setSelectedCategory('');
    setSelectedPriceRange('');
    setSelectedConcerns([]);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    selectedSkinTypes.length > 0 ||
    selectedCategory ||
    selectedPriceRange ||
    selectedConcerns.length > 0 ||
    searchQuery;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Skincare Products
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Explore our dermatologist-curated library of skincare products
          </p>
        </div>

        {/* Search + Sort bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">🔍</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, brands, ingredients..."
              className="input pl-12"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
            className="input sm:w-48"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className={`btn-secondary flex items-center gap-2 ${hasActiveFilters ? 'border-primary-500 text-primary-600 dark:text-primary-400' : ''}`}
          >
            🎛️ Filters
            {hasActiveFilters && (
              <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {selectedSkinTypes.length + selectedConcerns.length + (selectedCategory ? 1 : 0) + (selectedPriceRange ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Filters panel */}
        {filtersOpen && (
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Skin type */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Skin Type</h4>
                <div className="space-y-2">
                  {skinTypeOptions.map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSkinTypes.includes(type)}
                        onChange={() => toggleSkinType(type)}
                        className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Category</h4>
                <select
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                  className="input text-sm py-2"
                >
                  <option value="">All categories</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat} className="capitalize">{cat}</option>
                  ))}
                </select>
              </div>

              {/* Price range */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Price Range</h4>
                <div className="space-y-2">
                  {priceRangeOptions.map((range) => (
                    <label key={range} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priceRange"
                        value={range}
                        checked={selectedPriceRange === range}
                        onChange={() => { setSelectedPriceRange(range); setCurrentPage(1); }}
                        className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">{range}</span>
                    </label>
                  ))}
                  {selectedPriceRange && (
                    <button
                      onClick={() => setSelectedPriceRange('')}
                      className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mt-1"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Concerns */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Concerns</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {concernOptions.map((concern) => (
                    <label key={concern} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedConcerns.includes(concern)}
                        onChange={() => toggleConcern(concern)}
                        className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">{concern}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results count */}
        {!loading && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {totalCount > 0 ? `${totalCount} products found` : 'No products found'}
            </p>
          </div>
        )}

        {/* Product detail modal */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedProduct(null)}>
            <div
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                      {selectedProduct.category}
                    </span>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">{selectedProduct.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedProduct.brand}</p>
                  </div>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  {selectedProduct.description}
                </p>
                {selectedProduct.ingredients.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Key Ingredients</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProduct.ingredients.slice(0, 10).map((ing) => (
                        <span key={ing} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    ${selectedProduct.price.toFixed(2)}
                  </span>
                  {selectedProduct.buyUrl ? (
                    <a
                      href={selectedProduct.buyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                    >
                      Buy Now →
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400">Not available</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button onClick={fetchProducts} className="btn-primary">Try Again</button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No products found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Try adjusting your filters or search query
            </p>
            <button onClick={clearFilters} className="btn-secondary">Clear Filters</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onViewDetails={setSelectedProduct}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn-secondary py-2 px-4 disabled:opacity-40"
            >
              ← Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const page = currentPage <= 4 ? i + 1 : currentPage - 3 + i;
              if (page < 1 || page > totalPages) return null;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    currentPage === page
                      ? 'bg-primary-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn-secondary py-2 px-4 disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
