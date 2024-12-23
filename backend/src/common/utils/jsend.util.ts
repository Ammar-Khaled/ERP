export const jsend = {
  success: (data: any = null) => ({
    status: 'success',
    data: data,
  }),

  fail: (data: any = null, message: string = 'An error occurred') => ({
    status: 'fail',
    data: data || null,
    message: message || 'An error occurred',
  }),

  error: (message: string) => ({
    status: 'error',
    message: message,
  }),
};
