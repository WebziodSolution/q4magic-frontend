import { useEffect } from "react";
import '@authid/web-component';

const AuthIdModal = ({ url, onClose, onSuccess }) => {
  useEffect(() => {
    // The web component might handle events internally
    // Let's also set up a message listener as a fallback
    const handleMessage = (event) => {
      if (event.data.success) {
        onSuccess(event.data);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onClose, onSuccess]);

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="relative w-full h-full">
        <button
          onClick={onClose}
          className="absolute z-50 top-10 right-10 w-10 h-10 text-lg font-bold border border-black rounded-full text-center cursor-pointer"
        >
          ×
        </button>
        <authid-component
          id="authId"
          data-url={url}
          data-webauth="true"
          onAuthidSuccess={(e) => onSuccess(e.detail)}
          onAuthidError={(e) => {
            console.error('AuthID error:', e.detail);
            onClose();
          }}
          onAuthidClose={onClose}
          style={{ width: '100%', height: '100%' }}
        ></authid-component>
      </div>
    </div>
  );
};

export default AuthIdModal;