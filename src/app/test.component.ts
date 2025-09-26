import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div class="max-w-4xl mx-auto space-y-8">
        <!-- Header Section -->
        <header class="text-center">
          <h1 class="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            <span class="block">Welcome to Your</span>
            <span class="block text-primary-600">Design System</span>
          </h1>
          <p class="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            This is a showcase of the custom Tailwind CSS configuration with a comprehensive design system.
          </p>
        </header>

        <!-- Color Palette -->
        <section class="mt-12">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Color Palette</h2>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div class="space-y-2">
              <h3 class="font-medium text-gray-700">Primary</h3>
              <div class="h-12 rounded-lg bg-primary-500"></div>
              <p class="text-sm text-gray-600">Primary-500</p>
            </div>
            <div class="space-y-2">
              <h3 class="font-medium text-gray-700">Secondary</h3>
              <div class="h-12 rounded-lg bg-secondary-500"></div>
              <p class="text-sm text-gray-600">Secondary-500</p>
            </div>
            <div class="space-y-2">
              <h3 class="font-medium text-gray-700">Success</h3>
              <div class="h-12 rounded-lg bg-success-500"></div>
              <p class="text-sm text-gray-600">Success-500</p>
            </div>
            <div class="space-y-2">
              <h3 class="font-medium text-gray-700">Warning</h3>
              <div class="h-12 rounded-lg bg-warning-500"></div>
              <p class="text-sm text-gray-600">Warning-500</p>
            </div>
            <div class="space-y-2">
              <h3 class="font-medium text-gray-700">Error</h3>
              <div class="h-12 rounded-lg bg-error-500"></div>
              <p class="text-sm text-gray-600">Error-500</p>
            </div>
          </div>
        </section>

        <!-- Typography -->
        <section class="mt-12">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Typography</h2>
          <div class="space-y-4">
            <h1 class="text-4xl font-bold">Heading 1 - The quick brown fox jumps over the lazy dog</h1>
            <h2 class="text-3xl font-bold">Heading 2 - The quick brown fox jumps over the lazy dog</h2>
            <h3 class="text-2xl font-bold">Heading 3 - The quick brown fox jumps over the lazy dog</h3>
            <p class="text-lg">Body text - The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.</p>
            <p class="text-sm text-gray-600">Small text - The quick brown fox jumps over the lazy dog.</p>
          </div>
        </section>

        <!-- Buttons -->
        <section class="mt-12">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Buttons</h2>
          <div class="flex flex-wrap gap-4">
            <button class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
              Primary Button
            </button>
            <button class="px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors">
              Secondary Button
            </button>
            <button class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Outline Button
            </button>
            <button class="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium">
              Text Button
            </button>
          </div>
        </section>

        <!-- Cards -->
        <section class="mt-12">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Cards</h2>
          <div class="grid gap-6 md:grid-cols-2">
            <div class="bg-white rounded-xl shadow-md overflow-hidden">
              <div class="h-48 bg-gradient-to-r from-primary-500 to-secondary-500"></div>
              <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900">Card Title</h3>
                <p class="mt-2 text-gray-600">This is a card component with a gradient header and some sample content.</p>
                <button class="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
            <div class="bg-white rounded-xl shadow-md overflow-hidden">
              <div class="h-48 bg-gradient-to-r from-warning-500 to-error-500"></div>
              <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900">Another Card</h3>
                <p class="mt-2 text-gray-600">This is another card with a different color scheme and layout.</p>
                <div class="mt-4 flex justify-between items-center">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-warning-100 text-warning-800">
                    New
                  </span>
                  <button class="text-primary-600 hover:text-primary-700 font-medium">
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Form Elements -->
        <section class="mt-12">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Form Elements</h2>
          <div class="max-w-md space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="you@example.com">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="••••••••">
            </div>
            <div class="flex items-center">
              <input id="remember-me" type="checkbox" class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded">
              <label for="remember-me" class="ml-2 block text-sm text-gray-700">Remember me</label>
            </div>
            <button class="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
              Sign In
            </button>
          </div>
        </section>
      </div>
    </div>
  `,
  standalone: true
})
export class TestComponent { }
