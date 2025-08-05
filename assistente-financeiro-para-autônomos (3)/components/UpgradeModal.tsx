
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

// <<<=== PASSO FINAL: COLE SEU LINK DE PAGAMENTO DO STRIPE AQUI ===>>>
// Crie o link no seu painel do Stripe e substitua a string abaixo.
const STRIPE_PAYMENT_LINK: string = 'https://buy.stripe.com/test_8x23cvae995MaagetU14400'; // <--- COLOQUE SEU LINK AQUI


interface UpgradeModalProps {
    message: string;
    onClose: () => void;
    userEmail?: string | null;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ message, onClose, userEmail }) => {

    const handleUpgradeClick = () => {
        if (STRIPE_PAYMENT_LINK === 'COLE_SEU_LINK_AQUI' || !STRIPE_PAYMENT_LINK.startsWith('https://buy.stripe.com/')) {
            alert('Por favor, configure o Link de Pagamento do Stripe no arquivo "components/UpgradeModal.tsx" para continuar.');
            return;
        }

        let finalUrl = STRIPE_PAYMENT_LINK;
        // Adiciona o e-mail do usuário à URL para pré-preenchimento no checkout do Stripe
        // Isso é crucial para que o webhook possa identificar o cliente.
        if (userEmail) {
            const separator = finalUrl.includes('?') ? '&' : '?';
            finalUrl += `${separator}prefilled_email=${encodeURIComponent(userEmail)}`;
        }

        // Abre o link de pagamento seguro do Stripe em uma nova aba.
        window.open(finalUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div 
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex justify-center items-center" 
            onClick={onClose}
        >
            <div 
                className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-md mx-4 text-center transform transition-all animate-in fade-in-0 zoom-in-95" 
                onClick={e => e.stopPropagation()}
            >
                <div className="mx-auto mb-4 bg-cyan-500/10 border border-cyan-500/30 rounded-full h-16 w-16 flex items-center justify-center">
                    <SparklesIcon />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Funcionalidade Pro</h2>
                <p className="text-slate-300 mb-6">{message}</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button 
                        onClick={onClose} 
                        className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-6 rounded-lg transition-colors order-2 sm:order-1"
                    >
                        Continuar Testando
                    </button>
                    <button 
                        onClick={handleUpgradeClick}
                        className="bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-lg shadow-cyan-500/20 order-1 sm:order-2"
                    >
                        Fazer Upgrade para o Pro
                    </button>
                </div>
            </div>
        </div>
    );
};