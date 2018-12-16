import "reflect-metadata";
import { App } from './App'

const port = parseInt(process.env.PORT) || 3000;

new App(port);