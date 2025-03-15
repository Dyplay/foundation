import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const VERIFICATION_TOKEN = '5110352d-afa7-454a-b0ed-58661e16c0d5';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const formData = await request.formData();
    const data = JSON.parse(formData.get('data') as string);

    // Verify the request is from Ko-fi
    if (data.verification_token !== VERIFICATION_TOKEN) {
      console.error('Invalid verification token received:', data.verification_token);
      return new Response('Invalid verification token', { status: 401 });
    }

    // Handle different types of Ko-fi transactions
    switch (data.type) {
      case 'Shop Order':
        // Handle shop order
        console.log('Shop order received:', {
          from: data.from_name,
          amount: data.amount,
          items: data.shop_items,
          shipping: data.shipping
        });
        break;

      case 'Donation':
        // Handle donation
        console.log('Donation received:', {
          from: data.from_name,
          amount: data.amount,
          message: data.message
        });
        break;

      case 'Subscription':
        // Handle subscription
        console.log('Subscription payment received:', {
          from: data.from_name,
          amount: data.amount,
          isFirst: data.is_first_subscription_payment,
          tierName: data.tier_name
        });
        break;

      default:
        console.log('Unknown transaction type:', data.type);
    }

    // Return success response
    return json({
      success: true,
      message: 'Webhook received and processed'
    });

  } catch (error) {
    console.error('Error processing Ko-fi webhook:', error);
    return new Response('Error processing webhook', { status: 500 });
  }
}; 