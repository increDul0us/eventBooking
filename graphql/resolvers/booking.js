const Event = require('../../models/event')
const Booking = require('../../models/booking')
const { transformBooking, transformEvent } = require('./merge')
// const paypal = require('paypal-rest-sdk')

// paypal.configure({
//   'mode': 'sandbox', // sandbox or live
//   'client_id': 'AaU8tQfmz1_MFDTKuf84yYERXvdDt2ZFJVrxhNW_49DazF4A_F0VBuKyV5_nntyEdZqUa5Oq9ZBj65GV',
//   'client_secret': 'EAZ8aFDU4lHHLy1bQqULYWqznf3dBknXZW3AH__zFC0bUs8AGUyR6RNbm-jHvqtikX7PsSqMO5vxuvKm'
// })

module.exports = {
  bookings: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!')
    }
    try {
      const bookings = await Booking.find({ user: req.userId })
      return bookings.map(booking => {
        return transformBooking(booking)
      })
    } catch (err) {
      throw err
    }
  },
  bookEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!')
    }
    // const create_payment_json = {
    //   'intent': 'ticket',
    //   'payer': {
    //     'payment_method': 'paypal'
    //   },
    //   'redirect_urls': {
    //     'return_url': 'http://localhost:3000/success',
    //     'cancel_url': 'http://localhost:3000/cancel'
    //   },
    //   'transactions': [{
    //     'item_list': {
    //       'items': [{
    //         'name': 'Red Sox Hat',
    //         'sku': '001',
    //         'price': '25.00',
    //         'currency': 'USD',
    //         'quantity': 1
    //       }]
    //     },
    //     'amount': {
    //       'currency': 'USD',
    //       'total': '25.00'
    //     },
    //     'description': 'Hat for the best team ever'
    //   }]
    // }

    // paypal.payment.create(create_payment_json, function (error, payment) {
    //   if (error) {
    //     throw error
    //   } else {
    //     for (let i = 0; i < payment.links.length; i++) {
    //       if (payment.links[i].rel === 'approval_url') {
    //         res.redirect(payment.links[i].href)
    //       }
    //     }
    //   }
    // })
    const fetchedEvent = await Event.findOne({ _id: args.eventId })
    const booking = new Booking({
      user: req.userId,
      event: fetchedEvent
    })
    const result = await booking.save()
    return transformBooking(result)
  },
  cancelBooking: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!')
    }
    try {
      const booking = await Booking.findById(args.bookingId).populate('event')
      const event = transformEvent(booking.event)
      await Booking.deleteOne({ _id: args.bookingId })
      return event
    } catch (err) {
      throw err
    }
  }
}
