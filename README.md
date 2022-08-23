# Viðvera - Presence system

## Problem statement

Snerpa has used a presence system for many years now, the presence system works alright but is not responsive and just outdated. Snerpa uses the system both for internal use in addition to having a call center that has access to the presence system to see who is available to take calls. We wanted to create a presence system that is responsive since most of the time we are updating our presence through our mobile devices when running out of the office or going from one place to another outside the office, also when working from home this is useful to see who is available and who's not. I found during my initial user interviews was that a presence system is a big nice to have but the problem is that they are used incorrectly or just not used at all by the users. This is where I got the idea of adding some automation to the presence system, it would be able to connect to the companies phone system (PBX) to see if the user is on the phone and that way mark the user with a status of "busy" or "on the phone", would also be able to track the users presence in teams and/or connect to the users calendar, for example, outlook or google calendar, this way we could use all these factors to determan if the user is available or not. There were also some ideas about geolocation or geofencing to get the users availability but we would have to tread lightly in this area since most people would not want their employer tracking their location.

Current system only has in or out option and no automation. Here is a preview of the current system:

[![Kerfill Viðveru kerfi](/assets/Kerfill.png)](https://interns-tracka.vercel.app/)

## Tech stack

#### Code organization and productivity

- [Gitlab](https://gitlab.com/)
  - Version control
  - Agile workflow with issues -> feature branch -> merge request -> code review
- [Nx Monorepo](https://nx.dev/)

#### Communication and coworking

- [Microsoft Teams](https://www.microsoft.com/en/microsoft-teams/)
- [Live Share extension](https://marketplace.visualstudio.com/items?itemName=MS-vsliveshare.vsliveshare-pack) - For pair programming and co-working

#### Design

- [Figma](https://www.figma.com/) - Frontend desgin
- [Draw.io](https://draw.io/) - Database designMea

## Code

#### Infrastructure

- [Keycloak](https://www.keycloak.org/) Self-hosted authentication server
- [Kubernetes](https://kubernetes.io/) For hosting
<!-- - [Jest](https://jestjs.io/) For unit tests -->

#### Backend

- [PostgreSQL](https://www.postgresql.org/) Database
- [MikroORM](https://mikro-orm.io/) For managing the database with Typescript
- [NestJS](https://nestjs.com/) For building the web service (API)
- [Swagger](https://swagger.io/) For API documentation
- [Nodemailer](https://nodemailer.com/) For sending emails from the web service, for example an invite

#### Frontend

- [React](https://reactjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [TailwindUI](https://tailwindui.com/)
- [Formik](https://formik.org/) For creating and validating forms
- [TanStack's React Query](https://tanstack.com/query/v4) For asynchronous state management on API queries
- [@react-keycloak/web](https://www.npmjs.com/package/@react-keycloak/web) For auth context
