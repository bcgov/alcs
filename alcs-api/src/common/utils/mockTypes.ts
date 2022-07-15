import { Repository } from 'typeorm';

export type MockType<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [P in keyof T]?: jest.Mock<{}>;
};

export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(
  () => ({
    findOne: jest.fn((entity) => entity),
    save: jest.fn((entity) => entity),
    find: jest.fn((entity) => [entity]),
    softRemove: jest.fn((entity) => [entity]),
  }),
);
