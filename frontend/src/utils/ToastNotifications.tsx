import { toast, ToastContainer, ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ShowToastParams {
  type: boolean;
  message: string;
  options?: ToastOptions;
}

export const showToast = ({ type, message, options }: ShowToastParams) => {
  const toastOptions: ToastOptions = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options,
  };

  if (type) {
    toast.success(message || "Operation successful", toastOptions);
  } else {
    toast.error(message || "An error occurred", toastOptions);
  }
};

const ToastNotifications: React.FC = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
  );
};

export default ToastNotifications;
