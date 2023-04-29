const { name } = require('ejs');
const express = require('express');
const router = express.Router();

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const shiftSchema = new mongoose.Schema({
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  location: { type: String, required: true },
});

const checkInSchema = new mongoose.Schema({
  //user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  checkInTime: { type: Date, required: true },
  lat: { type: String, required: true },
  long: { type: String, required: true },
  image: { type: String, required: true },
});


const scheduledShiftSchema = new mongoose.Schema({
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
});

const User = mongoose.model('User', userSchema);
const Shift = mongoose.model('Shift', shiftSchema);
const CheckIn = mongoose.model('CheckIn', checkInSchema);
const ScheduledShift = mongoose.model('ScheduledShift', scheduledShiftSchema);



let nextUserId = 0;

User.find().then(products =>{
    var latestId = 0;
    for(var count= 0; count< products.length ; count++){
      var id = Number(products[count].userId)
      if(id < latestId){
        latestId = id;
      }
      nextUserId = id + 1;
      
    }
})
 
router.post('/scheduleShift', (req, res, next) => {
  const { startTime, endTime } = req.body;
  const scheduledShift = new ScheduledShift({
    startTime,
    endTime,
  });

  scheduledShift.save()
    .then(result => {
      console.log('Scheduled shift saved to database');
      res.status(201).json({
        message: 'Scheduled shift created successfully',
        scheduledShift: result
      });
    })
    .catch(err => {
      console.log('Failed to save scheduled shift to database: ' + err);
      res.status(500).json({
        error: err
      });
    });
});


router.get('/scheduledshifts', (req, res, next) => {
  ScheduledShift.find()
  .exec((err, shifts) => {
    if (err) {
      console.log('Failed to find scheduled shifts: ' + err)
      res.status(500).json({ error: 'Failed to find scheduled shifts' });
    } else {
      res.status(200).json({ shifts: shifts });
    }
  })
});

router.delete('/deleteShift', (req, res, next) => {
  ScheduledShift.findOneAndRemove({ _id: req.body._id}) 
    .then(resp => {
      //res.redirect('/')
      console.log('deleted schedule')

    })
    .catch(err => {
      console.log('Failed to find schedule: ' + err)
      res.send('No schedule found')
    })
})

router.put('/updateShift', (req, res, next) => {
  ScheduledShift.findOne({ _id: req.body._id })
  .then(shift => {
    if (!shift) {
      console.log('Failed to find shift')
      res.send('No shift found')
    } else {
      shift.startTime = req.body.startTime
      shift.endTime = req.body.endTime
      shift.save()
      console.log('Updated shift!')
      res.send('Shift updated')
    }
  })
  .catch(err => {
    console.log('Failed to find shift: ' + err)
    res.send('Failed to update shift')
  })
})

router.post('/checkin', (req, res, next) => {
  const { checkInTime, lat, long, image } = req.body; //userid
  const checkIn = new CheckIn({
    //user: userId,
    checkInTime,
    lat,
    long,
    image: image, //Buffer.from(image, 'base64'),
  });

  checkIn.save()
    .then(result => {
      res.status(201).json({
        message: 'Check-in created successfully',
        checkIn: result
      });
    })
    .catch(err => {
      console.log('Failed to save check-in to database: ' + err);
      res.status(500).json({
        error: err
      });
    });
});

// router.post('/', (req, res, next) => {
//   console.log(req.body.testData)
//   Product.find() // Always returns an array
//     .then(products => {
//       res.json({'POST Mongoose Products': products})
//     })
//     .catch(err => {
//       console.log('Failed to find: ' + err)
//       res.json({'Products': []})
//     })
// })

router.post('/getSpecificProduct', (req, res, next) => {
  Product.find({ name: req.body.name}) // Always returns an array
    .then(products => {
      res.send(JSON.stringify(products[0])) // Return the first one found
    })
    .catch(err => {
      console.log('Failed to find product: ' + err)
      res.send('No product found')
    })
})

router.put('/updateSpecificProduct', (req, res, next) => {
  Product.find({ userId: req.body.userId}) // Always returns an array
    .then(products => {

      let specificProduct = products[0] // pick the first match
      specificProduct.price = req.body.price
      specificProduct.save() // Should check for errors here too
      console.log('Updated item price!')

    })
    .catch(err => {
      console.log('Failed to find product: ' + err)
      res.send('No product found')
    })
})

router.delete('/deleteSpecificProduct', (req, res, next) => {
  Product.findOneAndRemove({ userId: req.body.userId}) 
    .then(resp => {
      //res.redirect('/')
      console.log('deleted product to database')

    })
    .catch(err => {
      console.log('Failed to find product: ' + err)
      res.send('No product found')
    })
})

exports.routes = router
