import { Controller } from '@nestjs/common';
import { API_URL } from 'src/environments';

@Controller(`${API_URL}/wallet`)
export class WalletController {}
