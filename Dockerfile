FROM public.ecr.aws/lambda/nodejs:18

# Bundle app source
COPY . ${LAMBDA_TASK_ROOT}

CMD [ "app.api" ]