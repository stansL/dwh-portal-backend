import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetArtOptimizationCurrentByPartnerQuery } from '../impl/get-art-optimization-current-by-partner.query';
import { InjectRepository } from '@nestjs/typeorm';
import { FactTransOptimizeRegLines } from '../../entities/fact-trans-optimize-reg-lines.model';
import { Repository } from 'typeorm';

@QueryHandler(GetArtOptimizationCurrentByPartnerQuery)
export class GetArtOptimizationCurrentByPartnerHandler implements IQueryHandler<GetArtOptimizationCurrentByPartnerQuery> {
    constructor(
        @InjectRepository(FactTransOptimizeRegLines, 'mssql')
        private readonly repository: Repository<FactTransOptimizeRegLines>
    ) {

    }

    async execute(query: GetArtOptimizationCurrentByPartnerQuery): Promise<any> {
        const artOptimizationCurrentByPartner = this.repository.createQueryBuilder('f')
            .select(['CTPartner partner, CurrentRegimen regimen, Gender gender, Agegroup, sum(TXCurr) txCurr'])
            .where('MFLCode IS NOT NULL');

        if (query.county) {
            artOptimizationCurrentByPartner.andWhere('f.County IN (:...county)', { county: query.county });
        }

        if (query.subCounty) {
            artOptimizationCurrentByPartner.andWhere('f.Subcounty IN (:...subCounty)', { subCounty: query.subCounty });
        }

        if (query.facility) {
            artOptimizationCurrentByPartner.andWhere('f.FacilityName IN (:...facility)', { facility: query.facility });
        }

        if (query.partner) {
            artOptimizationCurrentByPartner.andWhere('f.CTPartner IN (:...partner)', { partner: query.partner });
        }

        if (query.agency) {
            artOptimizationCurrentByPartner.andWhere('f.CTAgency IN (:...agency)', { agency: query.agency });
        }

        // if (query.project) {
        //     artOptimizationCurrentByPartner.andWhere('f.project IN (:...project)', { project: query.project });
        // }

        // if(query.month) {
        //     artOptimizationCurrentByPartner.andWhere('f.StartARTMonth IN (:...month)', { month: query.month });
        // }

        // if (query.year) {
        //     artOptimizationCurrentByPartner.andWhere('f.StartARTYr IN (:...year)', { year: query.year });
        // }

        if (query.gender) {
            artOptimizationCurrentByPartner.andWhere('f.Gender IN (:...gender)', { gender: query.gender });
        }

        if (query.datimAgeGroup) {
            artOptimizationCurrentByPartner.andWhere('f.DATIM_AgeGroup IN (:...datimAgeGroup)', { datimAgeGroup: query.datimAgeGroup });
        }

        if (query.populationType) {
            artOptimizationCurrentByPartner.andWhere('f.PopulationType IN (:...populationType)', { populationType: query.populationType });
        }

        if (query.latestPregnancy) {
            artOptimizationCurrentByPartner.andWhere('f.LatestPregnancy IN (:...latestPregnancy)', { latestPregnancy: query.latestPregnancy });
        }

        return await artOptimizationCurrentByPartner
            .groupBy('CTPartner, CurrentRegimen, Gender, Agegroup')
            .orderBy('CTPartner, CurrentRegimen, Gender, Agegroup')
            .getRawMany();
    }
}
