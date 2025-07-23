import { config } from '@config';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon-only' | 'text-only';
  className?: string;
  showText?: boolean;
  textClassName?: string;
  iconClassName?: string;
}

export function Logo({ 
  size = 'md', 
  variant = 'full',
  className = '',
  showText = true,
  textClassName = '',
  iconClassName = ''
}: LogoProps) {
  const sizeClasses = {
    sm: {
      container: 'h-6 w-6',
      icon: 'width="16" height="16"',
      text: 'text-sm'
    },
    md: {
      container: 'h-8 w-8',
      icon: 'width="20" height="20"',
      text: 'text-lg'
    },
    lg: {
      container: 'h-10 w-10',
      icon: 'width="24" height="24"',
      text: 'text-xl'
    }
  };

  const currentSize = sizeClasses[size];

  const IconComponent = () => (
    <div className={`${currentSize.container} rounded-full bg-chart-1 flex items-center justify-center ${iconClassName}`}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        {...(currentSize.icon.includes('16') ? { width: "16", height: "16" } :
           currentSize.icon.includes('20') ? { width: "20", height: "20" } :
           { width: "24", height: "24" })}
        viewBox="0 0 24 24" 
        className="text-white"
      >
        <g fill="none" fillRule="evenodd">
          <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/>
          <path fill="currentColor" d="M14.211 17.776a4 4 0 0 1 3.364-.099l.214.1l2.658 1.328a1 1 0 0 1-.787 1.835l-.107-.046l-2.659-1.329a2 2 0 0 0-1.617-.076l-.172.076l-1.316.659a4 4 0 0 1-3.365.098l-.213-.098l-1.317-.659a2 2 0 0 0-1.617-.076l-.172.076l-2.658 1.33a1 1 0 0 1-.996-1.731l.102-.059l2.658-1.329a4 4 0 0 1 3.364-.099l.214.1l1.316.658a2 2 0 0 0 1.618.076l.171-.076zM13 2a1 1 0 0 1 1 1v1.32l3.329.554a2 2 0 0 1 1.67 1.973v3.432l2.06.686a1.25 1.25 0 0 1 .753 1.679l-2.169 5.06l-1.854-.928a4 4 0 0 0-3.578 0l-1.317.659a2 2 0 0 1-1.789 0l-1.316-.659a4 4 0 0 0-3.578 0l-1.27.636l-2.658-4.651a1.25 1.25 0 0 1 .69-1.806L5 10.279V6.847a2 2 0 0 1 1.67-1.973L10 4.32V3a1 1 0 0 1 1-1zm-1 4.014l-5 .833v2.766l4.367-1.456a2 2 0 0 1 1.265 0L17 9.613V6.847z"/>
        </g>
      </svg>
    </div>
  );

  const TextComponent = () => (
    <span className={`font-bold text-foreground ${currentSize.text} ${textClassName}`}>
      {config.app.name}
    </span>
  );

  if (variant === 'icon-only') {
    return <IconComponent />;
  }

  if (variant === 'text-only') {
    return <TextComponent />;
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <IconComponent />
      {showText && <TextComponent />}
    </div>
  );
} 