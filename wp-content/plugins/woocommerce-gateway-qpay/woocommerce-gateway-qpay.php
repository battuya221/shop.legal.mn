<?php

/*
 * Plugin Name: WooCommerce qPay Payment Gateway
 * Plugin URI: 
 * Description: qPay Gateway
 * Author: anyanyany
 * Author URI: https://anyanyany.io
 * Version: 1.0.0
 */

defined('ABSPATH') or exit;


// Make sure WooCommerce is active
if (!in_array('woocommerce/woocommerce.php', apply_filters('active_plugins', get_option('active_plugins')))) {
	return;
}


/**
 * Add the gateway to WC Available Gateways
 *
 * @since 1.0.0
 * @param array $gateways all available WC gateways
 * @return array $gateways all WC gateways + qpay gateway
 */
function wc_qpay_add_to_gateways($gateways)
{
	$gateways[] = 'WC_Gateway_Qpay';
	return $gateways;
}
add_filter('woocommerce_payment_gateways', 'wc_qpay_add_to_gateways');


/**
 * Adds plugin page links
 *
 * @since 1.0.0
 * @param array $links all plugin links
 * @return array $links all plugin links + our custom links (i.e., "Settings")
 */
function wc_qpay_gateway_plugin_links($links)
{

	$plugin_links = array(
		'<a href="' . admin_url('admin.php?page=wc-settings&tab=checkout&section=qpay_gateway') . '">' . __('Configure', 'wc-gateway-qpay') . '</a>'
	);

	return array_merge($plugin_links, $links);
}
add_filter('plugin_action_links_' . plugin_basename(__FILE__), 'wc_qpay_gateway_plugin_links');


/**
 * qpay Payment Gateway
 *
 * Provides an qpay Payment Gateway; mainly for testing purposes.
 * We load it later to ensure WC is loaded first since we're extending it.
 *
 * @class 		WC_Gateway_Qpay
 * @extends		WC_Payment_Gateway
 * @version		1.0.0
 * @package		WooCommerce/Classes/Payment
 * @author 		SkyVerge
 */
add_action('plugins_loaded', 'wc_qpay_qpay_gateway_init', 11);
function wc_qpay_qpay_gateway_init()
{

	class WC_Gateway_Qpay extends WC_Payment_Gateway
	{
		/**
		 * Constructor for the gateway.
		 */
		public function __construct()
		{

			//add_action('wp_ajax_qpay', array($this, 'qpay_response'));
			$this->qimage = '';

			$this->id                 = 'qpay_gateway';
			$this->icon               = apply_filters('woocommerce_qpay_icon', plugin_dir_url(__FILE__) . '/images/icon.png');
			$this->has_fields         = false;
			$this->method_title       = __('Qpay', 'wc-gateway-qpay');
			$this->method_description = __('Allows Khan bank\'s payments card.', 'wc-gateway-qpay');

			$this->notify_url = WC()->api_request_url('WC_Gateway_Qpay');

			// Load the settings.
			$this->init_form_fields();
			$this->init_settings();

			// Define user set variables
			$this->title        			= $this->get_option('title');
			$this->description  			= $this->get_option('description');
			$this->merchant_url 	= $this->get_option('merchant_url');
			$this->merchant_username	= $this->get_option('merchant_username');
			$this->merchant_password 	= $this->get_option('merchant_password');
			$this->merchant_invoice_code 	= $this->get_option('merchant_invoice_code');

			// Actions
			add_action('woocommerce_update_options_payment_gateways_' . $this->id, array($this, 'process_admin_options'));
			add_action('woocommerce_api_wc_gateway_qpay', array($this, 'qpay_response'));
			add_action('wp_enqueue_scripts', array($this, 'qpay_scripts'));
		}


		/**
		 * Initialize Gateway Settings Form Fields
		 */
		public function init_form_fields()
		{

			$this->form_fields = apply_filters('wc_qpay_form_fields', array(

				'enabled' => array(
					'title'   => __('Enable/Disable', 'wc-gateway-qpay'),
					'type'    => 'checkbox',
					'label'   => __('Enable Khanbank Qpay Payment', 'wc-gateway-qpay'),
					'default' => 'yes'
				),

				'title' => array(
					'title'       => __('Title', 'wc-gateway-qpay'),
					'type'        => 'text',
					'description' => __('This controls the title for the payment method the customer sees during checkout.', 'wc-gateway-qpay'),
					'default'     => __('Qpay', 'wc-gateway-qpay'),
					'desc_tip'    => true,
				),

				'description' => array(
					'title'       => __('Description', 'wc-gateway-qpay'),
					'type'        => 'textarea',
					'description' => __('Payment method description that the customer will see on your checkout.', 'wc-gateway-qpay'),
					'default'     => __('QPay үйлчилгээг ашиглан гар утсаараа QR код уншуулан төлбөр төлөх боломжтой.', 'wc-gateway-qpay'),
					'desc_tip'    => true,
				),

				'merchant_url' => array(
					'title'       => __('URL', 'wc-gateway-qpay'),
					'type'        => 'text',
					'description' => __('Put your URL here.', 'wc-gateway-qpay'),
					'default'     => __('', 'wc-gateway-qpay'),
					'desc_tip'    => true,
				),

				'merchant_username' => array(
					'title'       => __('Username', 'wc-gateway-qpay'),
					'type'        => 'text',
					'description' => __('Put your username here.', 'wc-gateway-qpay'),
					'default'     => __('', 'wc-gateway-qpay'),
					'desc_tip'    => true,
				),

				'merchant_password' => array(
					'title'       => __('Password', 'wc-gateway-qpay'),
					'type'        => 'text',
					'description' => __('Put your password here.', 'wc-gateway-qpay'),
					'default'     => __('', 'wc-gateway-qpay'),
					'desc_tip'    => true,
				),

				'merchant_invoice_code' => array(
					'title'       => __('Invoice Code', 'wc-gateway-qpay'),
					'type'        => 'text',
					'description' => __('Put your invoice code here.', 'wc-gateway-qpay'),
					'default'     => __('', 'wc-gateway-qpay'),
					'desc_tip'    => true,
				),



			));
		}



		/**
		 * Process the payment and return the result
		 *
		 * @param int $order_id
		 * @return array
		 */
		public function process_payment($order_id)
		{

			$order 	= wc_get_order($order_id);
			$amount = $order->order_total;
			$url = $this->merchant_url;

			$response = wp_remote_post(
				$url . 'auth/token',
				array(
					'headers' => array(
						'Authorization' => 'Basic ' . base64_encode($this->merchant_username . ':' . $this->merchant_password)
					)
				)
			);

			$res = '';
			$resCreate = [];

			// echo $this->merchant_username;
			// echo $this->merchant_password;

			if (is_wp_error($response)) {
				$error_message = $response->get_error_message();
				echo "Something went wrong: $error_message";
			} else {
				$res = json_decode($response['body'], true);

				// var_dump($res);

				$responseCreate = wp_remote_post(
					$url . 'invoice',
					array(
						'headers'     => array(
							'Authorization' => 'Bearer ' . $res['access_token'],
						),
						'body' => array(
							'invoice_code'		=> $this->merchant_invoice_code,
							'sender_invoice_no' => $order_id,
							"invoice_receiver_code" => "terminal",
							"invoice_description" => $order_id,
							'amount'		=> $amount,
						)
					)
				);

				if (is_wp_error($responseCreate)) {
					$error_message = $responseCreate->get_error_message();
					echo "Something went wrong: $error_message";
				} else {
					$resCreate = json_decode($responseCreate['body'], true);
				}
			}

			// Return thankyou redirect
			$body = '<html><body><script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script><script>';
			$body .= 'var div = document.getElementsByClassName("payment_method_qpay_gateway")[1];';
			$body .= 'var childs = div.children;';
			$body .= 'var holder = document.createElement("div");';
			$body .= 'var img = document.createElement("img");';
			$body .= 'var p = document.createElement("p");';
			$body .= 'var warn = document.createElement("p");';
			$body .= 'var a = document.createElement("a");';
			$body .= 'img.setAttribute("src", "data:image/png;base64,' . $resCreate['qr_image'] . '");';

			$body .= 'holder.classList.add("qpay_holder");';
			$body .= 'img.classList.add("qpay-qr");';
			$body .= 'warn.classList.add("qpay-warning");';
			$body .= 'div.innerHTML = "";';
			$body .= 'a.innerText = "Банкны апп сонгох";';
			$body .= 'a.setAttribute("href", "' . $resCreate['qPay_shortUrl'] . '");';
			$body .= 'a.classNames += " checkPaymentQpay";';
			$body .= 'p.innerHTML = "' . $this->description . '";';
			$body .= 'warn.innerHTML = "Төлбөр амжилттай төлөгдсөний дараа хуудас автоматаар шилжинэ!";';
			$body .= 'holder.appendChild(p);';
			$body .= 'holder.appendChild(a);';
			$body .= 'holder.appendChild(img);';
			$body .= 'holder.appendChild(warn);';
			$body .= 'div.appendChild(holder);';
			$body .= 'var timer = setInterval(()=>{jQuery.ajax({url: \'wc-api/WC_Gateway_Qpay\',type: "GET",data: {invoiceId: "' . $resCreate['invoice_id'] . '", orderId: ' . $order_id . ', token: "' . $res['access_token'] . '" },dataType: "html",success: function(data){var dta = JSON.parse(data);if(dta && dta.redirect){window.location.href = dta.redirect; clearInterval(timer);};},error: function(jqXHR, exception){}});},10000);';
			$body .= '</script></body></html>';
			return array(
				'result' 	=> 'success',
				'qPay_QRimage'	=>  $resCreate['qr_image'],
				'qPay_QRcode'	=>  $resCreate['qr_text'],
				'qPay_url'	=>  $resCreate['qPay_shortUrl'],
				'invoice_id'	=>  $resCreate['invoice_id'],
				'order_id'	=>  $order_id,
				'messages'	=> $body,
				'response'	=> $responseCreate
			);
		}



		public function qpay_response()
		{
			$url = $this->merchant_url;

			$responseCheck = wp_remote_post(
				$url . 'payment/check',
				array(
					'headers'     => array(
						'Authorization' => 'Bearer ' . $_GET['token'],
					),
					'body' => array(
						"object_type" => "INVOICE",
						"object_id" => $_GET['invoiceId']
					)
				)
			);

			$order = wc_get_order($_GET['orderId']);
			if (is_wp_error($responseCheck)) {
				$error_message = $responseCheck->get_error_message();
				echo "Something went wrong: $error_message";
			} else {
				$resCheck = json_decode($responseCheck['body'], true);

				if (array_key_exists('rows', $resCheck) && count($resCheck['rows']) > 0) {
					add_post_meta($_GET['orderId'], 'qpay_response', json_encode($responseCheck['body']));
					if ($resCheck['rows'][0]['payment_status'] == "PAID") {
						$ress = array(
							'redirect' => get_home_url() . '/checkout/order-received/' . $_GET['orderId'] . '?key=' . $order->order_key . ''
						);
						echo json_encode($ress);
						die();
					}
				} else {
					if ($resCheck['error'] == 'NO_CREDENDIALS') {
						$response = wp_remote_post(
							$url . 'auth/token',
							array(
								'headers' => array(
									'Authorization' => 'Basic ' . base64_encode($this->merchant_username . ':' . $this->merchant_password)
								)
							)
						);

						$res = '';

						if (is_wp_error($response)) {
							$error_message = $response->get_error_message();
							echo "Something went wrong: $error_message";
						} else {
							$res = json_decode($response['body'], true);

							$responseCheck = wp_remote_post(
								$url . 'payment/check',
								array(
									'headers'     => array(
										'Authorization' => 'Bearer ' . $res['access_token'],
									),
									'body' => array(
										"object_type" => "INVOICE",
										"object_id" => $_GET['invoiceId']
									)
								)
							);

							$order = wc_get_order($_GET['orderId']);
							if (is_wp_error($responseCheck)) {
								$error_message = $responseCheck->get_error_message();
								echo "Something went wrong: $error_message";
							} else {
								$resCheck = json_decode($responseCheck['body'], true);
								if (array_key_exists('rows', $resCheck) && count($resCheck['rows']) > 0) {
									add_post_meta($_GET['orderId'], 'qpay_response', json_encode($responseCheck['body']));
									if ($resCheck['rows'][0]['payment_status'] == "PAID") {
										$ress = array(
											'redirect' => get_home_url() . '/checkout/order-received/' . $_GET['orderId'] . '?key=' . $order->order_key . ''
										);
										echo json_encode($ress);
										die();
									}
								}
							}
						}
					}
				}
			}


			wp_die();
		}

		public function qpay_scripts()
		{
			wp_enqueue_style('qpay-css', plugin_dir_url(__FILE__) . '/style.css', '', '', 'screen');
		}
	} // end \WC_Gateway_Qpay class
}
