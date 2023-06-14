import {  Gql } from './codegen';


export const getData = async () => {
  const data =  await Gql('query')({
    metadata: {
      enterprise: true,
    },
  });

  return data;
};
