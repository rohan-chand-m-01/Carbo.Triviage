import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen mesh-gradient bg-background p-6">
      <div className="glass p-2 sm:p-4 rounded-[2.5rem] border-white/10 shadow-2xl">
        <SignUp 
          appearance={{
            variables: {
              colorPrimary: '#3b82f6',
              colorText: 'white',
              colorBackground: 'transparent',
              colorInputBackground: 'rgba(255,255,255,0.05)',
              colorInputText: 'white',
            },
            elements: {
              card: 'bg-transparent shadow-none border-0',
              headerTitle: 'text-3xl font-bold tracking-tight',
              headerSubtitle: 'text-muted-foreground',
              socialButtonsBlockButton: 'glass border-white/10 hover:bg-white/5 transition-all',
              formButtonPrimary: 'bg-primary hover:bg-primary/90 transition-all font-bold py-3',
              dividerLine: 'bg-white/10',
              footerActionLink: 'text-primary hover:text-white transition-colors'
            }
          }}
        />
      </div>
    </div>
  );
}
