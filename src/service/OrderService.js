import http from "../api/httpClient";
import toast from "react-hot-toast";





export const place_Order = async ({ planId, getToken, onSuccess }) => {

    try {
        const token = await getToken();
        const response = await http.post(`/api/orders?planId=${planId}`, {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }
        );


        if (response.status === 200) {
            initializePayment({ order: response.data.data, getToken, onSuccess });

        }


    } catch (error) {

        toast.error("Error placing order. Please try again later." + error.message);
        // Re-throw the error for further handling 

    }
}

const initializePayment = ({ order, getToken, onSuccess }) => {

    const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Credit_Payment",
        description: "Purchase of credits",
        order_id: order.id,
        receipt: order.receipt,
        handler: async (paymentDetails) => {
            try {
                const token = await getToken();
                const response = await http.post(`/api/orders/verify`, paymentDetails,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (response.status === 200) {
                    toast.success("Credits Added Successfully");
                    toast("Please Refresh the page to see the updated credits");
                    onSuccess?.();
                }
            } catch (error) {
                toast.error("Error verifying payment. Please try again later." + error.message);
            }

        }
    }
    const rzp = new window.Razorpay(options);
    rzp.open();
}
