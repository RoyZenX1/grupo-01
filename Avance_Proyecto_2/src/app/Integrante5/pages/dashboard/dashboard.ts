import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CurrencyPipe, RouterLink],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Dashboard {
    readonly auth = inject(AuthService);
    private datos = inject(DashboardService);

    readonly flota = this.datos.flota;
    readonly ordenes = this.datos.ordenes;
    readonly estadosFlota = this.datos.estadosFlota;
    readonly estadosOrdenes = this.datos.estadosOrdenes;
    readonly ultimasOrdenes = this.datos.ultimasOrdenes;

    /** Accesos rápidos: todos los módulos permitidos para el rol, menos el propio dashboard. */
    readonly accesos = computed(() =>
        this.auth.menu().filter(item => item.modulo !== 'dashboard')
    );
}
