"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { authClientReact } from "@libs/auth/authClient";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { type SupportedLocale, locales } from "@libs/i18n";
import { useTranslation } from "@/hooks/use-translation";

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { t, locale: currentLocale } = useTranslation();
  
  const { 
    data: session, 
    isPending
  } = authClientReact.useSession();
  const user = session?.user;

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSignOut = async () => {
    await authClientReact.signOut();
    router.push(`/${currentLocale}`);
  };

  const handleLanguageChange = (locale: SupportedLocale) => {
    // Get the current path without the locale prefix
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '') || '/';
    
    // Navigate to the new locale path
    router.push(`/${locale}${pathWithoutLocale}`);
    
    // Store the preference
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
  };

  return (
    <header className={`w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link href={`/${currentLocale}`} className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                T
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                TinyShip
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex md:space-x-8">
            <Link href={`/${currentLocale}/ai`} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              {t.header.navigation.ai}
            </Link>
            <Link href={`/${currentLocale}/premium-features`} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              {t.header.navigation.premiumFeatures}
            </Link>
            <Link href={`/${currentLocale}/pricing`} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              {t.header.navigation.pricing}
            </Link>
          </nav>

          {/* User menu or Auth buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isDarkMode ? (
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </Button>

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                  {currentLocale === 'en' ? t.header.language.english : t.header.language.chinese}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="dark:bg-slate-800 dark:border-slate-700">
                {locales.map((locale) => (
                  <DropdownMenuItem
                    key={locale}
                    onClick={() => handleLanguageChange(locale)}
                    className="dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    {locale === 'en' ? t.header.language.english : t.header.language.chinese}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {isPending ? (
              <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-700 animate-pulse"></div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 focus:outline-none">
                    <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-600">
                      <AvatarImage src={user.image || ""} alt={user.name || user.email || "User"} />
                      <AvatarFallback className="bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs">
                        {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{user.name || user.email}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 dark:bg-slate-800 dark:border-slate-700" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium dark:text-slate-200">{user.name || "User"}</p>
                      <p className="text-xs text-muted-foreground dark:text-slate-400">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="dark:bg-slate-600" />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href={`/${currentLocale}/dashboard`} className="flex items-center dark:text-slate-300 dark:hover:bg-slate-700">
                        <svg className="mr-2 h-4 w-4 text-slate-500 dark:text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        {t.header.userMenu.personalSettings}
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="dark:bg-slate-600" />
                  <DropdownMenuItem className="text-red-600 dark:text-red-400 dark:hover:bg-slate-700" onClick={handleSignOut}>
                    <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    {t.header.auth.signOut}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href={`/${currentLocale}/signin`}>
                  <Button variant="ghost" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800">
                    {t.header.auth.signIn}
                  </Button>
                </Link>
                <Link href={`/${currentLocale}/signup`}>
                  <Button variant="default" className="text-sm font-medium bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 border-0 rounded-full">
                    {t.header.auth.getStarted}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href={`/${currentLocale}/ai`} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800">
              {t.header.navigation.ai}
            </Link>
            <Link href={`/${currentLocale}/premium-features`} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800">
              {t.header.navigation.premiumFeatures}
            </Link>
            <Link href={`/${currentLocale}/pricing`} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800">
              {t.header.navigation.pricing}
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-slate-100 dark:border-slate-700">
            {user ? (
              <div className="px-4 space-y-1">
                <div className="flex items-center px-3">
                  <div className="flex-shrink-0">
                    <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-600">
                      <AvatarImage src={user.image || ""} alt={user.name || user.email || "User"} />
                      <AvatarFallback className="bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm">
                        {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-slate-800 dark:text-slate-200">{user.name || "User"}</div>
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{user.email}</div>
                  </div>
                </div>
                <Link href={`/${currentLocale}/settings`} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800">
                  {t.header.userMenu.personalSettings}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800"
                >
                  {t.header.auth.signOut}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-4 px-4 py-2">
                <Link href={`/${currentLocale}/signin`} className="w-1/2">
                  <Button variant="outline" className="w-full text-sm font-medium border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                    {t.header.auth.signIn}
                  </Button>
                </Link>
                <Link href={`/${currentLocale}/signup`} className="w-1/2">
                  <Button variant="default" className="w-full text-sm font-medium bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 border-0 rounded-full text-white dark:text-slate-900">
                    {t.header.auth.getStarted}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
} 