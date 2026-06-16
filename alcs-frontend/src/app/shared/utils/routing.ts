import { ActivatedRoute } from '@angular/router';

export const findFileNumberInRouteTree = (startingRoute: ActivatedRoute): string => {
  let route: ActivatedRoute | null = startingRoute;

  while (route) {
    const fileNumber = route.snapshot.paramMap.get('fileNumber');

    if (fileNumber) {
      return fileNumber;
    }

    route = route.parent;
  }

  throw new Error('File number not found in route');
};
