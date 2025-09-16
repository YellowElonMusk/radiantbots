import radiantbotsLogo from '@/assets/radiantbots-logo.png';

interface HeaderProps {
  onNavigate: (page: string) => void;
}

export function Header({ onNavigate }: HeaderProps) {
  return (
    <header className="absolute top-0 left-0 right-0 z-10 p-6">
      <div className="container mx-auto flex justify-between items-center">
        <button
          onClick={() => onNavigate('landing')}
          className="focus:outline-none"
        >
          <img 
            src={radiantbotsLogo} 
            alt="Radiantbots" 
            className="h-8 w-auto hover:opacity-80 transition-opacity"
          />
        </button>
      </div>
    </header>
  );
}