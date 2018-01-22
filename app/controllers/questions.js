/**
 * Module dependencies.
 */
/* eslint-disable no-shadow */
import mongoose from 'mongoose';

const Question = mongoose.model('Question');


/**
 * function that select a question for a game round
 *
 * @param {obj} req - request object
 * @param {obj} res - response object
 *  @param {funct} next - question id
 * @param {string} id - question id
 *
 * @return {void} question
 */
export const question = (req, res, next, id) => {
  Question.load(id, (err, question) => {
    if (err) return next(err);
    if (!question) return next(new Error(`Failed to load question ${id}`));
    req.question = question;
    next();
  });
};

/**
 * displays a question
 *
 * @param {obj} req - request object
 * @param {obj} res - response object
 *
 * @return {void} question
 */
export const show = (req, res) => {
  res.jsonp(req.question);
};

/**
 * function
 *
 * @param {obj} req - request object
 * @param {obj} res - response object
 *
 * @return {void} question
 */
export const all = (req, res) => {
  Question.find({ official: true, numAnswers: { $lt: 3 } }).select('-_id')
    .exec((err, questions) => {
      if (err) {
        res.render('error', {
          status: 500
        });
      } else {
        res.jsonp(questions);
      }
    });
};

/**
 * List of Questions (for Game class)
 * @param {func} callBack callback after finding questions
 * @param {string} regionId region to sort questions by
 * @returns {func} calls callback with questions found
*/
export const allQuestionsForGame = (callBack, regionId) => {
  Question.find({ official: true, regionId, numAnswers: { $lt: 3 } })
    .select('-_id').exec((err, questions) => {
      if (err) {
        return err;
      }
      callBack(questions);
    });
};
