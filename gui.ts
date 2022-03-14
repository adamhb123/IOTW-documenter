import {
  QMainWindow,
  QWidget 
} from "@nodegui/nodegui";

// Configurables
const WINDOW_DIMENSIONS = [230, 300];

const win = new QMainWindow();
win.setFixedSize(WINDOW_DIMENSIONS[0], WINDOW_DIMENSIONS[1]);

const rootView = new QWidget();


win.show();

(global as any).win = win;
