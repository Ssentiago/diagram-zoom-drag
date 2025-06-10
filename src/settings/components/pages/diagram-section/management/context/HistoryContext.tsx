import createHistoryContext from '../../../../core/HistoryContextGeneric';
import { DiagramData } from '../../../../../typing/interfaces';

const context = createHistoryContext<DiagramData[]>();

const useDiagramHistoryContext = context.useHistoryContext;
const DiagramHistoryProvider = context.HistoryProvider;

export { useDiagramHistoryContext, DiagramHistoryProvider };
