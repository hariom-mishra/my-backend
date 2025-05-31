const asyncHandler = (requestHandler) => {
    (req, res, next) => {
         Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    }
}


// const asyncHandler = (requestHanlder) => async (req, res, next) => {
//     try {
//         await requestHanlder(req, res, next);
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             error: error.message
//         })
//     }
// }