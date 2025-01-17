import { Express } from 'express'
import { ClientInvoicesRepoAggregate } from '../repositories/clientInvoicesRepoAggregate'
import { verifyTokenMiddleware } from "../middleware/verifyTokenMiddleware"
import { ClientsRepository } from '../repositories/clientsRepository'
import { InvoiceData, InvoicesRepository } from '../repositories/invoicesRepository'
import { UsersRepository } from '../repositories/usersRepository'

export const mainRoutes = (app: Express ) => {

    app.get("/invoices", verifyTokenMiddleware, async (req, res) => {
        const { filter, sort } = req.body
        try {
            const invoiceAggregate = app.get("invoiceClientAggregate") as ClientInvoicesRepoAggregate
            const userId = (req as any).user.user_id;
            const result = await invoiceAggregate.getInvoices({
                userId, filter, sort
            })
            return res.json({invoices: result})
        } catch (err) {
            res.status(500).send(err.message)
        }
    })

    app.post("/invoices", verifyTokenMiddleware, async (req, res) => {
       try {
        const invoiceAggregate = app.get("invoiceClientAggregate") as ClientInvoicesRepoAggregate
        const userId = (req as any).user.user_id as string;
        const result = await invoiceAggregate.addInvoice({user_id: userId, invoiceData: req.body as Partial<InvoiceData> })
        return res.json({success: true, invoice: result})
       } catch (err) {
           res.status(500).send(err.message)
       }
    })

    app.put("/invoices", verifyTokenMiddleware, async (req, res) => {
        try {
            const invoicesRepo = app.get("invoicesRepo") as InvoicesRepository
            const userId = (req as any).user.user_id as string;
            const invoiceData = await invoicesRepo.getById(req.body.id)
            
            if ( !invoiceData ) {
                res.status(404).send("Client not found. Cannot update.")
            }
            
            if ( invoiceData.user_id !== userId ) {
                res.status(404).send("Client not found. Cannot update.")
            }
            
            const result = await invoicesRepo.update({user_id: userId, ...req.body})
            return res.json({success: true, invoice: result})
           } catch (err) {
               res.status(500).send(err.message)
           }
     })

    app.get("/clients", verifyTokenMiddleware, async (req, res) => {
        const invoiceAggregate = app.get("invoiceClientAggregate") as ClientInvoicesRepoAggregate
        const { filter, sort } = req.body
        try {
            const userId = (req as any).user.user_id;
            const result = await invoiceAggregate.getClients({
                userId, filter, sort
            })
            setTimeout(() => {
                res.json({clients: result})
            }, 1000)
            return 
        } catch (err) {
            console.log(err.message);
            res.status(500).send(err.message)
        }
    })

    app.post("/clients", verifyTokenMiddleware, async (req, res) => {
        try {
         const clientsRepo = app.get("clientsRepo") as ClientsRepository
         const userId = (req as any).user.user_id as string;
         const result = await clientsRepo.add({user_id: userId, ...req.body})
         return res.json({success: true, client: result})
        } catch (err) {
            res.status(500).send(err.message)
        }
     })

     app.put("/clients", verifyTokenMiddleware, async (req, res) => {
        try {
            const clientsRepo = app.get("clientsRepo") as ClientsRepository
            const userId = (req as any).user.user_id as string;
            const userOwningClient = await clientsRepo.getById(req.body.id)
            
            if ( !userOwningClient ) {
                res.status(404).send("Client not found. Cannot update.")
            }
            
            if ( userOwningClient.user_id !== userId ) {
                res.status(404).send("Client not found. Cannot update.")
            }
            
            const result = await clientsRepo.update({user_id: userId, ...req.body})
            return res.json({success: true, client: result})
           } catch (err) {
               res.status(500).send(err.message)
           }
     })

     app.get("/me", verifyTokenMiddleware, async (req, res) => {
        try {
            const usersRepo = app.get("usersRepo") as UsersRepository
            const userId = (req as any).user.user_id as string;
            const foundUser = await usersRepo.getById(userId)
            foundUser.companyDetails ??= null;
            return res.json(foundUser)
        } catch (err) {
            res.status(500).send(err.message)
        }
     })

     app.put("/me/company", verifyTokenMiddleware, async (req,res) => {
        try {
            const usersRepo = app.get("usersRepo") as UsersRepository
            const userId = (req as any).user.user_id as string;
            const updatedUser = await usersRepo.updateCompanyDetails(userId, req.body)
            return res.status(200).json({success: true, user: updatedUser})
        } catch (err) {
            res.status(500).send(err.message)
        }
     })
}
