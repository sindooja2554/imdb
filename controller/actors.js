/**
 * @description API controller Class
 * @file        controller.actors.js
 * @overview    API controller class controls all the API's, gives call to
 *              service functions of the API's
 * @author      Sindooja Gajam
 * @version     node v12.16.1
 * @since       01 April 2020
 */

let actorService = require('../services/actors');
let logger = require('../config/winston');

class Controller {
  addActor(request, response) {
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
        throw 'Actor sex should be F/f or M/m';

      request
        .check('name', 'Name must be character string only e.g.(John Latin)')
        .matches(/^[a-zA-Z]+ [a-zA-Z]+$/);
      request.check('sex', 'Sex must be character string only').isAlpha();
      request
        .check('dob', 'Date of birth must be in DD/MM/YYYY or DD-MM-YYYY')
        .matches(
          /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/
        );
      // request.check("bio" , "Bio must be a character string only").isAlpha();

      let errors = request.validationErrors();
      let result = {};
      if (errors) {
        result.error = errors[0].msg;
        result.success = false;
        result.message = 'Validation Error';
        return response.status(400).send(result);
      } else {
        let addingActorObject = {
          name: request.body.name,
          sex: request.body.sex,
          dob: request.body.dob,
          bio: request.body.bio,
        };
        actorService
          .addActor(addingActorObject)
          .then((data) => {
            result.success = true;
            result.message = 'Successfully added data of actor';
            result.data = data;
            return response.status(200).send(result);
          })
          .catch((error) => {
            result.success = false;
            result.message = "Server couldn't process the request";
            result.error = error;
            return response.status(500).send(result);
          });
      }
    } catch (error) {
      let result = {};
      result.success = false;
      result.message = "Request body doesn't contain sufficient request";
      result.error = error;
      return response.status(400).send(result);
    }
  }

  getAllActor(request, response) {
    let result = {};
    actorService
      .getAllActors()
      .then((data) => {
        if (data !== null) {
          result.success = true;
          result.message = 'Showing all the data of actors';
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
        result.message = "Server couldn't completely process the request";
        result.error = error;
        return response.status(500).send(result);
      });
  }

  delete(request, response) {
    let result = {};
    actorService
      .delete({ _id: request.params.actorId })
      .then((data) => {
        if (data !== null) {
          result.success = true;
          result.data = data;
          result.message = 'Successfully deleted';
          return response.status(200).send(result);
        } else {
          result.success = true;
          result.data = data;
          result.message = 'Data not found';
          return response.status(404).send(result);
        }
      })
      .catch((error) => {
        logger.error('error in catch block ' + error);
        result.success = false;
        result.message = 'Delete Unsuccessful';
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
        throw 'Actor sex should be F/f or M/m';

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
        logger.error(errors);
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
          actorId: request.params.actorId,
        };
        actorService
          .update({ _id: editObject.actorId }, editObject)
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
            logger.error('error in catch==========>' + error);
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

module.exports = new Controller();
