import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-sm ${
            star <= Math.round(rating)
              ? 'text-yellow-400'
              : 'text-gray-300 dark:text-gray-600'
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const priceRangeColor: Record<string, string> = {
  budget: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  mid: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  premium: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  luxury: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const priceClass = priceRangeColor[product.priceRange] || priceRangeColor['mid'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200">
      {/* Image placeholder */}
      <div className="relative bg-gradient-to-br from-skin-50 to-skin-200 dark:from-gray-700 dark:to-gray-600 h-40 flex items-center justify-center">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-5xl">🧴</span>
        )}
        {product.dermatologistApproved && (
          <div className="absolute top-2 right-2 bg-primary-600 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
            ✓ Derm Approved
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        {/* Category badge */}
        <span className="text-xs font-medium text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1">
          {product.category}
        </span>

        {/* Name & brand */}
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight mb-1 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{product.brand}</p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={product.rating} />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {product.rating.toFixed(1)} ({product.reviewCount.toLocaleString()})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="font-bold text-gray-900 dark:text-gray-100">
            ${product.price.toFixed(2)}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${priceClass}`}>
            {product.priceRange}
          </span>
        </div>

        {/* Skin types */}
        {product.skinTypes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {product.skinTypes.slice(0, 3).map((type) => (
              <span
                key={type}
                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full capitalize"
              >
                {type}
              </span>
            ))}
          </div>
        )}

        {/* Concerns */}
        {product.concerns.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {product.concerns.slice(0, 3).map((concern) => (
              <span
                key={concern}
                className="text-xs bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full capitalize"
              >
                {concern}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => onViewDetails?.(product)}
            className="flex-1 text-center text-sm font-medium py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Details
          </button>
          {product.buyUrl ? (
            <a
              href={product.buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center text-sm font-semibold py-2 px-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors duration-200"
            >
              Buy
            </a>
          ) : (
            <button
              disabled
              className="flex-1 text-center text-sm font-semibold py-2 px-3 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            >
              Buy
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
