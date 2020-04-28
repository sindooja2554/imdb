/**
 * @description API controller Class
 * @file        controller.producer.js
 * @overview    API controller class controls all the API's, gives call to
 *              service functions of the API's
 * @author      Sindooja Gajam
 * @version     node v12.16.1
 * @since       03 April 2020
 */

let producerService = require('../services/producers');
let logger = require('../config/winston');

class ProducerController {
  create(request, response) {
    try {
      if (
        request.body.name === undefined ||
        request.body.sex === undefined ||
        request.body.dob === undefined ||
        request.body.bio === undefined
      )
        throw 'Request body cannot be undefined';
      if (
        request.body.name === undefined ||
        request.body.sex === undefined ||
        request.body.dob === undefined ||
        request.body.bio === undefined
      )
        throw 'Request body cannot be null';
      if (
        request.body.sex !== 'm' &&
        request.body.sex !== 'M' &&
        request.body.sex !== 'f' &&
        request.body.sex !== 'F'
      )
        throw 'Producer sex should be F/f or M/m';

      request
        .check('name', 'Name must be character string only e.g.(John Latin)')
        .matches(/^[a-zA-Z]+ [a-zA-Z]+$/);
      request.check('sex', 'Sex must be character string only').isAlpha();
      request
        .check('dob', 'Date of birth must be in DD/MM/YYYY or DD-MM-YYYY')
        .matches(
          /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/
        );

      let errors = request.validationErrors();
      let result = {};
      if (errors) {
        result.error = errors[0].msg;
        result.success = false;
        return response.status(400).send(result);
      } else {
        let addingProducerObject = {
          name: request.body.name,
          sex: request.body.sex,
          dob: request.body.dob,
          bio: request.body.bio,
        };
        // return new Promise(resolve,reject=>{
        producerService
          .create(addingProducerObject)
          .then((data) => {
            result.success = true;
            result.message = 'Created Sucessfully';
            result.data = data;
            return response.status(200).send(result);
          })
          .catch((error) => {
            result.success = false;
            result.message = "Server couldn't process the request completely";
            result.error = error;
            return response.status(500).send(result);
          });
        // })
      }
    } catch (error) {
      let result = {};
      result.success = false;
      result.message = 'Request body missing an entity';
      result.error = error;
      return response.status(400).send(result);
    }
  }

  getAllProducers(request, response) {
    let result = {};
    producerService
      .getAllProducers()
      .then((data) => {
        if (data !== null) {
          result.success = true;
          result.message = 'Successfull getting all the data';
          result.data = data;
          return response.status(200).send(result);
        } else {
          result.success = true;
          result.message = 'No data found';
          result.data = data;
          return response.status(404).send(result);
        }
      })
      .catch((error) => {
        result.success = false;
        result.message = 'Error while processing the request';
        result.error = error;
        return response.status(500).send(result);
      });
  }

  delete(request, response) {
    let producerObject = {
      _id: request.params.producerId,
    };
    let result = {};
    producerService
      .delete(producerObject)
      .then((data) => {
        if (data !== null) {
          result.data = data;
          result.message = 'Successfully delete';
          result.success = true;
          return response.status(200).send(result);
        } else {
          result.data = data;
          result.success = true;
          result.message = 'No data found';
          return response.status(404).send(result);
        }
      })
      .catch((error) => {
        result.error = error;
        result.message = 'Delete Unsuccessful';
        result.success = false;
        return response.status(500).send(result);
      });
  }

  findOne(request, response) {
    let result = {};
    let producerObject = {
      _id: request.params.producerId,
    };

    producerService
      .findOne(producerObject)
      .then((data) => {
        if (data !== null) {
          result.message = 'Successfully found data';
          result.success = true;
          result.data = data;
          return response.status(200).send(result);
        } else {
          result.message = 'Data not found';
          result.success = true;
          result.data = data;
          return response.status(404).send(result);
        }
      })
      .catch((error) => {
        result.message = 'Error while finding data';
        result.success = false;
        result.error = error;
        return response.status(500).send(result);
      });
  }

  update(request, response) {
    try {
      if (
        request.body.name === undefined ||
        request.body.sex === undefined ||
        request.body.dob === undefined ||
        request.body.bio === undefined
      )
        throw 'Request body cannot be undefined';
      if (
        request.body.name === undefined ||
        request.body.sex === undefined ||
        request.body.dob === undefined ||
        request.body.bio === undefined
      )
        throw 'Request body cannot be null';
      if (
        request.body.sex !== 'm' &&
        request.body.sex !== 'M' &&
        request.body.sex !== 'f' &&
        request.body.sex !== 'F'
      )
        throw 'Producer sex should be F/f or M/m';

      request
        .check('name', 'Name must be character string only e.g.(John Latin)')
        .matches(/^[a-zA-Z]+ [a-zA-Z]+$/);
      request.check('sex', 'Sex must be character string only').isAlpha();
      request
        .check('dob', 'Date of birth must be in DD/MM/YYYY or DD-MM-YYYY')
        .matches(
          /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/
        );

      let errors = request.validationErrors();
      let result = {};
      if (errors) {
        result.error = errors[0].msg;
        result.success = false;
        result.message = 'Validation Error';
        return response.status(400).send(result);
      } else {
        let editObject = {
          name: request.body.name,
          sex: request.body.sex,
          dob: request.body.dob,
          bio: request.body.bio,
        };
        let idObject = {
          _id: request.params.producerId,
        };
        producerService
          .update({ _id: idObject._id }, editObject)
          .then((data) => {
            if (data !== null) {
              result.success = true;
              result.message = 'Update Successful';
              result.data = data;
              return response.status(200).send(result);
            } else {
              result.success = true;
              result.message = 'Data not found';
              result.data = data;
              return response.status(404).send(result);
            }
          })
          .catch((error) => {
            result.success = false;
            result.message = 'Update Unsuccessful';
            result.error = error;
            return response.status(500).send(result);
          });
      }
    } catch (error) {
      let result = {};
      logger.error('------------------------' + error);
      result.success = false;
      result.message = 'Request body is missing a varibale';
      result.error = error;
      return response.status(400).send(result);
    }
  }
}

module.exports = new ProducerController();
