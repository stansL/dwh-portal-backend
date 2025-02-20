import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetDsdStableOverallQuery } from '../impl/get-dsd-stable-overall.query';
import { InjectRepository } from '@nestjs/typeorm';
import { FactTransDsdAppointmentByStabilityStatus } from '../../entities/fact-trans-dsd-appointment-by-stability-status.model';
import { Repository } from 'typeorm';

@QueryHandler(GetDsdStableOverallQuery)
export class GetDsdStableOverallHandler implements IQueryHandler<GetDsdStableOverallQuery> {
    constructor(
        @InjectRepository(FactTransDsdAppointmentByStabilityStatus, 'mssql')
        private readonly repository: Repository<FactTransDsdAppointmentByStabilityStatus>
    ) {
    }

    async execute(query: GetDsdStableOverallQuery): Promise<any> {
        const dsdMmdStable = this.repository.createQueryBuilder('f')
            .select(['SUM([StabilityAssessment]) Stable, SUM([NumPatients])TXCurr, DATIM_AgeGroup ageGroup'])
            .where('f.MFLCode > 1')
            .andWhere('f.Stability = :stability', { stability: "Stable"});

        if (query.county) {
            dsdMmdStable.andWhere('f.County IN (:...counties)', { counties: query.county });
        }

        if (query.subCounty) {
            dsdMmdStable.andWhere('f.SubCounty IN (:...subCounties)', { subCounties: query.subCounty });
        }

        if (query.facility) {
            dsdMmdStable.andWhere('f.FacilityName IN (:...facilities)', { facilities: query.facility });
        }

        if (query.partner) {
            dsdMmdStable.andWhere('f.CTPartner IN (:...partners)', { partners: query.partner });
        }

        if (query.agency) {
            dsdMmdStable.andWhere('f.CTAgency IN (:...agencies)', { agencies: query.agency });
        }

        if (query.datimAgeGroup) {
            dsdMmdStable.andWhere('f.DATIM_AgeGroup IN (:...ageGroups)', { ageGroups: query.datimAgeGroup });
        }

        if (query.gender) {
            dsdMmdStable.andWhere('f.Gender IN (:...genders)', { genders: query.gender });
        }

        return await dsdMmdStable
            .groupBy('DATIM_AgeGroup')
            .getRawMany();
    }
}
