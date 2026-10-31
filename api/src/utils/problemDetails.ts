import { Response } from 'express';

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  code?: string;
  errors?: any;
}

export const sendProblem = (
  res: Response,
  status: number,
  title: string,
  detail: string,
  errors?: any,
  code?: string
): Response => {
  const problem: ProblemDetails = {
    type: `https://souq.example.com/errors/${status}`,
    title,
    status,
    detail,
    instance: res.req.originalUrl,
    code,
    errors,
  };

  return res.status(status).contentType('application/problem+json').json(problem);
};
