import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen mesh-gradient bg-background">
      <div className="glass p-8 rounded-[2rem] border-white/10">
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-primary hover:bg-primary/90 text-sm normal-case',
              card: 'bg-transparent shadow-none',
              headerTitle: 'text-white',
              headerSubtitle: 'text-muted-foreground',
              socialButtonsBlockButton: 'glass border-white/10 text-white hover:bg-white/5',
              dividerLine: 'bg-white/10',
              dividerText: 'text-muted-foreground',
              formFieldLabel: 'text-white',
              formFieldInput: 'glass border-white/10 text-white',
              footerActionLink: 'text-primary hover:text-primary/90'
            }
          }}
        />
      </div>
    </div>
  );
}
