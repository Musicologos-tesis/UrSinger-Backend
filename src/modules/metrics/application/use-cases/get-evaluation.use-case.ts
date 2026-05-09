import { IEvaluationRepository } from '../../domain/repositories/evaluation.repository.interface';
import { EvaluationNotFoundException } from '../../domain/exceptions/evaluation-not-found.exception';

export class GetEvaluationUseCase {
  constructor(private readonly evalRepo: IEvaluationRepository) {}

  async execute(sessionId: string) {
    const evaluation = await this.evalRepo.findBySessionId(sessionId);
    if (!evaluation) throw new EvaluationNotFoundException(sessionId);
    return evaluation;
  }
}
