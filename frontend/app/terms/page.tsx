
export default function TermsPage() {
    return (
        <div className="container mx-auto py-16 px-4 md:px-0 max-w-3xl">
            <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
            <p className="mb-4 text-muted-foreground">Last Updated: January 14, 2026</p>

            <div className="prose prose-zinc dark:prose-invert">
                <p>
                    Welcome to PRISM. By accessing or using our website and services, you agree to be bound by these Terms of Service.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">1. Use of Service</h2>
                <p>
                    PRISM provides AI-powered code analysis. You agree to use the service only for lawful purposes effectively related to software development and code review.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">2. Intellectual Property</h2>
                <p>
                    The content, features, and functionality of PRISM are owned by PRISM Inc. and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">3. Termination</h2>
                <p>
                    We may terminate or suspend your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">4. Limitation of Liability</h2>
                <p>
                    In no event shall PRISM Inc. be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                </p>
            </div>
        </div>
    )
}
