import { ResetPassword } from '@/components/ResetPassword';
import { LanguageProvider } from '@/contexts/LanguageContext';

const ResetPasswordPage = () => {
  const handleNavigate = (page: string) => {
    // For the reset password page, just redirect to home
    window.location.href = '/';
  };

  return (
    <LanguageProvider>
      <ResetPassword onNavigate={handleNavigate} />
    </LanguageProvider>
  );
};

export default ResetPasswordPage;