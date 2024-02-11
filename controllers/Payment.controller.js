const { default: mongoose } = require('mongoose');
const PaymentService = require('../services/Payment.service');
const SubscriptionService = require('../services/Subscription.service');
const SubscriptionPackageService = require('../services/SubscriptionPackage.service');

const Controller = require('./Controller');

class PaymentController extends Controller {
	constructor() {
		super(new PaymentService(), "payments route");
	}

	generatePaymentRequest = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {

			const user = {
				_id: req.req_user._id,
				email: req.req_user.email
			}

			const amount = req.subscriptionPackage.price;
			const currency = req.subscriptionPackage.currency;

			const extra = {
				subscriptionPackageId: req.subscriptionPackage._id,
				user: req.req_user._id,
			}

			const response = await this.service.generatePaystackPaymentUrl({ user, amount, currency, extra });
			return res.status(200).json({
				status: 200,
				body: response,
				route: this.routeString
			});
		} catch (err) {
			console.log(err);
			res.status(500).json({
				status: 500,
				msg: "Internal server error.",
				route: this.routeString
			});
		} 


	}

	verifyPaystackPaymentWebhook = async (req, res) => {
		if (req.body.event === "charge.success"){
			const reference = req.body.data.reference;
			if (!reference) {
				return this.respondParamsError(res);
			}

			try {
				const response = await this.service.getPaystackPayment(reference);
				const status = response?.status === "success" ? true : false;
				// Save subscription if payment does not exit
				if (status) {
					const existingPayment = await this.service.getOneByFilter({ paymentRef: reference });
					if (!existingPayment) {
						const session = await mongoose.startSession();
						try {
							session.startTransaction();
							const payment = {
								amount: response.amount / 100.00,
								paymentRef: response.reference,
								currency: response.currency,
								user: response.metadata.user,
							}
							const savedPayment = await this.service.create(payment);

							const subscriptionPackageService = new SubscriptionPackageService();

							const selectedPackage = await subscriptionPackageService.getOne(response.metadata.subscriptionPackageId);

							const subscriptionService = new SubscriptionService();

							const subscription = {
								user: response.metadata.user,
								payment: savedPayment._id,
								package: response.metadata.subscriptionPackageId,
								startTimestamp: Date.now(),
								endTimestamp: Date.now() + (86400000 * selectedPackage.duration),
							}
							subscriptionService.create(subscription);
							session.commitTransaction();
						} catch (error) {
							await session.abortTransaction();
							session.endSession();
							console.log(error);
						} finally {
							session.endSession();
						}
					}

				}

				return res.status(200).json({
					status: 200,
					body: { status },
					route: this.routeString
				});
			} catch (err) {
				console.log(err);
				res.status(500).json({
					status: 500,
					msg: "Internal server error.",
					route: this.routeString
				});
			}
		}
	}
}

module.exports = PaymentController;