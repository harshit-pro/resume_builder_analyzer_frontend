import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="mt-16 bg-gradient-to-b from-white/60 to-white/30 backdrop-blur-xl border-t border-white/40">
            <div className="mx-auto max-w-7xl px-4 py-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <Link to="/" className="inline-flex items-center gap-2">
                            <img src="/logo.svg" alt="logo" className="w-6 h-6" />
                            <span className="text-lg font-bold tracking-tight">ResumeIQ</span>
                        </Link>
                        <p className="mt-3 text-sm text-gray-600 max-w-xs">
                            Build modern, ATS-friendly resumes and optimize your profile with AI insights.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Product</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link to="/generate-resume" className="hover:text-gray-900">Resume Builder</Link></li>
                            <li><Link to="/resume-analyzer" className="hover:text-gray-900">Resume Analyzer</Link></li>
                            <li><Link to="/services" className="hover:text-gray-900">Services</Link></li>
                            <li><Link to="/about" className="hover:text-gray-900">About</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Resources</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><a href="#" className="hover:text-gray-900">Templates</a></li>
                            <li><a href="#" className="hover:text-gray-900">Guides</a></li>
                            <li><a href="#" className="hover:text-gray-900">Blog</a></li>
                            <li><Link to="/contact" className="hover:text-gray-900">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Stay in touch</h4>
                        <p className="text-sm text-gray-600 mb-3">Get occasional tips and product updates.</p>
                        <form className="flex items-center gap-2">
                            <input type="email" placeholder="Your email" className="flex-1 rounded-md border border-gray-200 bg-white/60 backdrop-blur px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                            <button type="button" className="rounded-md bg-indigo-600 text-white px-3 py-2 text-sm font-medium hover:bg-indigo-700">Subscribe</button>
                        </form>
                        <div className="flex items-center gap-3 mt-4 text-gray-500">
                            <a href="https://github.com/harshit-pro" aria-label="GitHub" className="hover:text-gray-700"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.153-1.11-1.461-1.11-1.461-.908-.62.069-.607.069-.607 1.003.07 1.532 1.03 1.532 1.03.892 1.53 2.341 1.088 2.91.833.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.112-4.555-4.947 0-1.092.39-1.987 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.503.337 1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.203 2.397.1 2.65.64.701 1.028 1.596 1.028 2.688 0 3.844-2.339 4.691-4.566 4.94.359.308.678.916.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .269.18.58.688.481A10.019 10.019 0 0022 12.017C22 6.484 17.523 2 12 2z" clipRule="evenodd" /></svg></a>
                            <a href="https://www.linkedin.com/in/harshit-tech/" aria-label="LinkedIn" className="hover:text-gray-700"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.141c-.966 0-1.75-.79-1.75-1.766s.784-1.766 1.75-1.766c.967 0 1.75.79 1.75 1.766s-.783 1.766-1.75 1.766zm13.5 11.141h-3v-5.604c0-1.337-.026-3.059-1.863-3.059-1.864 0-2.149 1.454-2.149 2.958v5.705h-3v-10h2.881v1.367h.041c.402-.761 1.383-1.563 2.846-1.563 3.044 0 3.607 2.004 3.607 4.611v5.585z" /></svg></a>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-500">
                    <p>© {new Date().getFullYear()} ResumeIQ. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        <Link to="/privacy" className="hover:text-gray-700">Privacy</Link>
                        <Link to="/terms" className="hover:text-gray-700">Terms</Link>
                        <a href="mailto:r954025@gmail.com" className="hover:text-gray-700">r954025@gmail.com</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
