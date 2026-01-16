
export default function PrivacyPage() {
    return (
        <div className="container mx-auto py-16 px-4 md:px-0 max-w-3xl">
            <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
            <p className="mb-4 text-muted-foreground">Last Updated: January 14, 2026</p>

            <div className="prose prose-zinc dark:prose-invert">
                <p>
                    Your privacy is important to us. It is PRISM's policy to respect your privacy regarding any information we may collect from you across our website.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
                <p>
                    We don&apos;t store your code. We only collect information about you if we have a reason to do so – for example, to provide our services, to communicate with you, or to make our services better. We collect information through GitHub OAuth (name, email, avatar) and data related to the repositories you connect for analysis.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Information</h2>
                <p>
                    We use the information we collect to operate and maintain our services, to improve user experience, and to analyze code as per your request. We generally delete raw code analysis data after 30 days unless you choose to retain it.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">3. Data Security</h2>
                <p>
                    We take reasonable measures to protect your personal information from unauthorized access, use, or disclosure. However, no internet transmission is completely secure, and we cannot guarantee absolute security.
                </p>
            </div>
        </div>
    )
}
