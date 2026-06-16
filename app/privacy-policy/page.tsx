export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in">
      <h1 className="font-serif text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
      
      <div className="prose-heritage max-w-none">
        <p className="text-lg text-muted mb-8">
          Welcome to Mehta Kutumb. We take your privacy and the security of your family's data extremely seriously. This policy outlines how we protect your information.
        </p>

        <h2 className="font-serif text-2xl font-bold mt-8 mb-4">1. Data Collection</h2>
        <p className="text-muted mb-6">
          We collect only the information necessary to maintain the Mehta Kutumb archive, such as names, dates of birth, contact details, and family relationships. This data is provided voluntarily by you or your family members.
        </p>

        <h2 className="font-serif text-2xl font-bold mt-8 mb-4">2. Restricted Access</h2>
        <p className="text-muted mb-6">
          The archive is strictly private. Access is granted exclusively to approved family members by an administrator. Unregistered or unapproved users cannot view any sensitive contact information, dates of birth, or family tree relationships.
        </p>

        <h2 className="font-serif text-2xl font-bold mt-8 mb-4">3. Data Usage</h2>
        <p className="text-muted mb-6">
          Your data is used solely for the purpose of fostering connection within the family. We do not, and will never, sell, rent, or share your personal information with third parties for marketing or any other purposes.
        </p>

        <h2 className="font-serif text-2xl font-bold mt-8 mb-4">4. Your Rights (GDPR & DPDP)</h2>
        <p className="text-muted mb-6">
          You have the right to access, correct, or delete your personal information at any time. If you wish to be removed from the family record entirely, please contact the administrator, or use the account deletion options provided in your profile settings.
        </p>

        <h2 className="font-serif text-2xl font-bold mt-8 mb-4">5. Cookies</h2>
        <p className="text-muted mb-6">
          We use strictly necessary cookies to keep you logged in securely and to remember your basic preferences (like acknowledging our cookie banner). We do not use tracking or advertising cookies.
        </p>

        <div className="mt-12 p-6 bg-surface rounded-xl border border-border">
          <h3 className="font-bold text-foreground mb-2">Contact Administrator</h3>
          <p className="text-sm text-muted">
            For any privacy concerns or to request data removal, please contact the Mehta Kutumb administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
